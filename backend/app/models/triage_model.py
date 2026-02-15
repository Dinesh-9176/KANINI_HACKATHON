"""Load and run the triage level prediction model."""

import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "triage_model.joblib")

_model = None


def get_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_triage(features: np.ndarray) -> dict:
    """Predict triage level and derive risk_level, priority_score, confidence.

    Args:
        features: shape (1, 6) - [age, heart_rate, systolic_bp, oxygen_sat, body_temp, chronic_disease_count]

    Returns:
        dict with risk_level, priority_score, confidence, triage_level
    """
    model = get_model()
    triage_level = int(model.predict(features)[0])
    probabilities = model.predict_proba(features)[0]
    confidence = int(round(float(np.max(probabilities)) * 100))

    # Map triage level to risk level and base priority score range
    if triage_level == 0:
        risk_level = "low"
        base_min, base_max = 10, 35
    elif triage_level == 1:
        risk_level = "medium"
        base_min, base_max = 36, 65
    elif triage_level == 2:
        risk_level = "high"
        base_min, base_max = 66, 89
    else:  # 3 = critical
        risk_level = "high"
        base_min, base_max = 90, 100

    # Use model confidence to place score within the range for this triage level
    # Higher confidence → higher end of the range
    range_position = float(np.max(probabilities))
    priority_score = int(base_min + (base_max - base_min) * range_position)
    priority_score = int(min(max(priority_score, base_min), base_max))

    return {
        "risk_level": risk_level,
        "priority_score": priority_score,
        "confidence": confidence,
        "triage_level": triage_level,
    }
