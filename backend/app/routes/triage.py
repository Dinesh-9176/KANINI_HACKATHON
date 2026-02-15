"""Triage API endpoint."""

import uuid
import logging
import json
import os
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.patient import PatientIntakeRequest, TriageResponse, ContributingFactor, TopDisease
from app.models.triage_model import predict_triage
from app.models.disease_model import predict_disease, get_symptom_columns
from app.utils.feature_engineering import (
    prepare_triage_features,
    prepare_symptom_features,
    compute_contributing_factors,
)
from app.utils.department_mapper import map_disease_to_department
from app.db.supabase_client import table_insert

logger = logging.getLogger(__name__)

router = APIRouter()


class FeedbackRequest(BaseModel):
    patient_id: str
    feedback_type: str  # "incorrect_priority", "wrong_diagnosis", "other"
    details: str
    corrected_priority: str | None = None


# Map department_mapper output names to Supabase department IDs
DEPT_NAME_TO_ID = {
    "Emergency": "emergency",
    "Emergency Medicine": "emergency",
    "Cardiology": "cardiology",
    "Neurology": "neurology",
    "Orthopedics": "orthopedics",
    "General Medicine": "general",
    "Pediatrics": "pediatrics",
    "Ophthalmology": "ophthalmology",
    "Pulmonology": "pulmonology",
    "Dermatology": "dermatology",
    "Gastroenterology": "gastroenterology",
    "ENT": "ent",
    "Nephrology": "nephrology",
    "Oncology": "oncology",
    "Endocrinology": "endocrinology",
    "Psychiatry": "psychiatry",
    "Urology": "urology",
    "Gynecology": "gynecology",
    "Hematology": "hematology",
    "Infectious Disease": "infectious-disease",
    "Rheumatology": "rheumatology",
}


@router.post("/triage", response_model=TriageResponse)
async def run_triage(request: PatientIntakeRequest):
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
    department = map_disease_to_department(disease_result["predicted_disease"])
    department_id = DEPT_NAME_TO_ID.get(department, "general")

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

    vitals = {
        "bloodPressure": f"{request.blood_pressure_systolic or 'N/A'}/{request.blood_pressure_diastolic or 'N/A'}",
        "heartRate": str(request.heart_rate or "N/A"),
        "temperature": str(request.temperature or "N/A"),
        "oxygenSaturation": str(request.oxygen_saturation or "N/A"),
        "respiratoryRate": str(request.respiratory_rate or "N/A"),
    }

    # --- Model 3: Length of Stay Prediction ---
    from app.models.los_model import predict_los
    los_result = predict_los(
        risk_level=triage_result["risk_level"],
        predicted_disease=disease_result["predicted_disease"],
        age=request.age,
        vitals=vitals
    )

    # --- Combine confidence from both models ---
    combined_confidence = int(
        triage_result["confidence"] * 0.6 + disease_result["disease_confidence"] * 0.4
    )

    patient_code = f"P-{uuid.uuid4().hex[:4].upper()}"

    # --- Persist to Supabase ---
    try:
        # 1. Insert patient
        patient_row = table_insert("patients", {
            "patient_code": patient_code,
            "name": request.name,
            "age": request.age,
            "gender": request.gender,
            "status": "waiting",
        })
        patient_id = patient_row["id"]

        # 2. Insert patient intake
        intake_row = table_insert("patient_intakes", {
            "patient_id": patient_id,
            "blood_pressure_systolic": request.blood_pressure_systolic,
            "blood_pressure_diastolic": request.blood_pressure_diastolic,
            "heart_rate": request.heart_rate,
            "temperature": request.temperature,
            "oxygen_saturation": request.oxygen_saturation,
            "respiratory_rate": request.respiratory_rate,
            "symptoms": request.symptoms,
            "conditions": request.conditions,
            "notes": request.notes,
            "intake_method": "manual",
        })

        # 3. Insert triage result
        triage_row = table_insert("triage_results", {
            "patient_id": patient_id,
            "intake_id": intake_row["id"],
            "risk_level": triage_result["risk_level"],
            "priority_score": triage_result["priority_score"],
            "triage_level": triage_result["triage_level"],
            "confidence": combined_confidence,
            "predicted_disease": disease_result["predicted_disease"],
            "department_id": department_id,
            "waiting_time": waiting_time,
            "estimated_los_days": los_result["estimated_los_days"],
            "los_confidence": los_result["los_confidence"],
        })

        # 4. Insert contributing factors
        for i, f in enumerate(factors):
            table_insert("contributing_factors", {
                "triage_id": triage_row["id"],
                "name": f["name"],
                "value": f["value"],
                "impact": f["impact"],
                "is_positive": f["isPositive"],
                "sort_order": i,
            })

        logger.info(f"Saved triage for patient {patient_code} (DB id: {patient_id})")
    except Exception as e:
        logger.error(f"Failed to persist triage to Supabase: {e}")
        # Non-fatal: still return the AI result even if DB save fails

    return TriageResponse(
        patient_id=patient_code,
        name=request.name,
        age=request.age,
        gender=request.gender,
        risk_level=triage_result["risk_level"],
        priority_score=triage_result["priority_score"],
        department=department,
        confidence=combined_confidence,
        predicted_disease=disease_result["predicted_disease"],
        top_diseases=[TopDisease(**d) for d in disease_result.get("top_diseases", [])],
        contributing_factors=[ContributingFactor(**f) for f in factors],
        waiting_time=waiting_time,
        estimated_los_days=los_result["estimated_los_days"],
        los_confidence=los_result["los_confidence"],
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
