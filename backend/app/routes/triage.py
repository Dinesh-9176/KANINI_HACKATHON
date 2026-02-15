"""Triage API endpoint."""

import uuid
from fastapi import APIRouter

from app.schemas.patient import PatientIntakeRequest, TriageResponse, ContributingFactor
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
async def run_triage(request: PatientIntakeRequest):
    """Run AI triage analysis on patient intake data."""

    # Count chronic conditions (exclude "None")
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

    # --- Estimate waiting time based on priority ---
    if triage_result["priority_score"] >= 80:
        waiting_time = 5
    elif triage_result["priority_score"] >= 60:
        waiting_time = 15
    elif triage_result["priority_score"] >= 40:
        waiting_time = 30
    else:
        waiting_time = 45

    # --- Build vitals dict for frontend display ---
    vitals = {
        "bloodPressure": f"{request.blood_pressure_systolic or 'N/A'}/{request.blood_pressure_diastolic or 'N/A'}",
        "heartRate": str(request.heart_rate or "N/A"),
        "temperature": str(request.temperature or "N/A"),
        "oxygenSaturation": str(request.oxygen_saturation or "N/A"),
        "respiratoryRate": str(request.respiratory_rate or "N/A"),
    }

    # --- Combine confidence from both models ---
    combined_confidence = int(
        triage_result["confidence"] * 0.6 + disease_result["disease_confidence"] * 0.4
    )

    return TriageResponse(
        patient_id=f"P-{uuid.uuid4().hex[:4].upper()}",
        name=request.name,
        age=request.age,
        gender=request.gender,
        risk_level=triage_result["risk_level"],
        priority_score=triage_result["priority_score"],
        department=department,
        confidence=combined_confidence,
        predicted_disease=disease_result["predicted_disease"],
        contributing_factors=[ContributingFactor(**f) for f in factors],
        waiting_time=waiting_time,
        vitals=vitals,
    )
