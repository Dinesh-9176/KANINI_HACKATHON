"""Triage API endpoint."""

import uuid
from fastapi import APIRouter

from app.schemas.patient import PatientIntakeRequest, TriageResponse, ContributingFactor as ContributingFactorSchema
from pydantic import BaseModel
from datetime import datetime
import json
import os
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models import sql_models

class FeedbackRequest(BaseModel):
    patient_id: str
    feedback_type: str  # "incorrect_priority", "wrong_diagnosis", "other"
    details: str
    corrected_priority: str | None = None
from app.models.triage_model import predict_triage
from app.models.disease_model import predict_disease, get_symptom_columns
from app.utils.feature_engineering import (
    prepare_triage_features,
    prepare_symptom_features,
    compute_contributing_factors,
)
from app.utils.department_mapper import map_disease_to_department

router = APIRouter()


@router.post("/triage", response_model=TriageResponse)
async def run_triage(request: PatientIntakeRequest, db: Session = Depends(get_db)):
    """Run AI triage analysis on patient intake data."""

    # Count chronic conditions
    chronic_count = len([c for c in request.conditions if c.lower() != "none"])

    # --- Model 1: Triage Level Prediction ---
    triage_features = prepare_triage_features(
        age=request.age,
        heart_rate=request.heart_rate,
        systolic_bp=request.blood_pressure_systolic,
        oxygen_saturation=request.oxygen_saturation,
        temperature_f=request.temperature,
        chronic_disease_count=chronic_count,
    )
    triage_result = predict_triage(triage_features)

    # --- Model 2: Disease Prediction ---
    symptom_columns = get_symptom_columns()
    symptom_features = prepare_symptom_features(request.symptoms, symptom_columns)
    disease_result = predict_disease(symptom_features)

    # --- Map disease to department ---
    department_id = map_disease_to_department(disease_result["predicted_disease"])
    
    # Get department name for response
    dept_obj = db.query(sql_models.Department).filter(sql_models.Department.id == department_id).first()
    department_name = dept_obj.name if dept_obj else "General Medicine"

    # --- Compute contributing factors ---
    factors = compute_contributing_factors(
        heart_rate=request.heart_rate,
        systolic_bp=request.blood_pressure_systolic,
        diastolic_bp=request.blood_pressure_diastolic,
        temperature_f=request.temperature,
        oxygen_saturation=request.oxygen_saturation,
        respiratory_rate=request.respiratory_rate,
        age=request.age,
    )

    # --- Estimate waiting time ---
    if triage_result["priority_score"] >= 80:
        waiting_time = 5
    elif triage_result["priority_score"] >= 60:
        waiting_time = 15
    elif triage_result["priority_score"] >= 40:
        waiting_time = 30
    else:
        waiting_time = 45

    # --- DATABASE PERSISTENCE ---
    
    # 1. Create Patient
    db_patient = sql_models.Patient(
        name=request.name,
        age=request.age,
        gender=request.gender,
        status="triage"
    )
    db.add(db_patient)
    db.flush() # get ID
    
    # 2. Create Intake
    db_intake = sql_models.PatientIntake(
        patient_id=db_patient.id,
        blood_pressure_systolic=request.blood_pressure_systolic,
        blood_pressure_diastolic=request.blood_pressure_diastolic,
        heart_rate=request.heart_rate,
        temperature=request.temperature,
        oxygen_saturation=request.oxygen_saturation,
        respiratory_rate=request.respiratory_rate,
        symptoms=request.symptoms,
        conditions=request.conditions,
        notes=request.notes,
        intake_method="manual"
    )
    db.add(db_intake)
    db.flush()
    
    # 3. Create Triage Result
    db_triage = sql_models.TriageResult(
        patient_id=db_patient.id,
        intake_id=db_intake.id,
        risk_level=triage_result["risk_level"],
        priority_score=triage_result["priority_score"],
        triage_level=triage_result["triage_level"],
        confidence=int(triage_result["confidence"] * 0.6 + disease_result["disease_confidence"] * 0.4),
        predicted_disease=disease_result["predicted_disease"],
        department_id=department_id,
        waiting_time=waiting_time
    )
    db.add(db_triage)
    db.flush()
    
    # 4. Create Contributing Factors
    for f in factors:
        db_factor = sql_models.ContributingFactor(
            triage_id=db_triage.id,
            name=f["name"],
            value=f["value"],
            impact=f["impact"],
            is_positive=f["isPositive"]
        )
        db.add(db_factor)
    
    db.commit()
    
    # --- Response Construction ---

    vitals = {
        "bloodPressure": f"{request.blood_pressure_systolic or 'N/A'}/{request.blood_pressure_diastolic or 'N/A'}",
        "heartRate": str(request.heart_rate or "N/A"),
        "temperature": str(request.temperature or "N/A"),
        "oxygenSaturation": str(request.oxygen_saturation or "N/A"),
        "respiratoryRate": str(request.respiratory_rate or "N/A"),
    }

    return TriageResponse(
        patient_id=db_patient.patient_code or db_patient.id, # In real app, patient_code is generated
        name=request.name,
        age=request.age,
        gender=request.gender,
        risk_level=triage_result["risk_level"],
        priority_score=triage_result["priority_score"],
        department=department_name,
        confidence=db_triage.confidence,
        predicted_disease=disease_result["predicted_disease"],
        contributing_factors=[ContributingFactorSchema(**f) for f in factors],
        waiting_time=waiting_time,
        vitals=vitals,
    )


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Log user feedback for error analysis."""
    
    # In a real production app, this would go to a database.
    # For the hackathon/demo, we'll append to a local JSONL file.
    log_entry = feedback.dict()
    log_entry["timestamp"] = datetime.now().isoformat()
    
    file_path = "feedback_log.json"
    
    try:
        with open(file_path, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Error writing feedback: {e}")
            
    return {"status": "success", "message": "Feedback received"}
