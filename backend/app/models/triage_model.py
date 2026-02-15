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

    # Map triage level to risk level and priority score range
    if triage_level == 0:
        risk_level = "low"
        priority_score = int(np.random.randint(10, 36))
    elif triage_level == 1:
        risk_level = "medium"
        priority_score = int(np.random.randint(36, 66))
    elif triage_level == 2:
        risk_level = "high"
        priority_score = int(np.random.randint(66, 90))
    else:  # 3 = critical
        risk_level = "high"
        priority_score = int(np.random.randint(90, 101))

    # Refine priority score using weighted probability
    weighted_score = sum(prob * level * 25 for level, prob in enumerate(probabilities))
    priority_score = int(min(max(weighted_score + 10, 5), 100))

    return {
        "risk_level": risk_level,
        "priority_score": priority_score,
        "confidence": confidence,
        "triage_level": triage_level,
    }
