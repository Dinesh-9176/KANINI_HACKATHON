"""Load and run the disease prediction model."""

import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "disease_model.joblib")
ENCODER_PATH = os.path.join(BASE_DIR, "saved_models", "disease_label_encoder.joblib")
COLUMNS_PATH = os.path.join(BASE_DIR, "saved_models", "symptom_columns.joblib")

_model = None
_label_encoder = None
_symptom_columns = None


def get_model():
    global _model, _label_encoder, _symptom_columns
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
        _symptom_columns = joblib.load(COLUMNS_PATH)
    return _model, _label_encoder, _symptom_columns


def predict_disease(symptom_features: np.ndarray) -> dict:
    """Predict disease from symptom binary vector.

    Args:
        symptom_features: shape (1, num_symptoms) binary vector

    Returns:
        dict with predicted_disease, disease_confidence, top_diseases
    """
    model, label_encoder, _ = get_model()
    prediction = model.predict(symptom_features)[0]
    probabilities = model.predict_proba(symptom_features)[0]

    predicted_disease = label_encoder.inverse_transform([prediction])[0]

    # Confidence calculation for many-class models:
    # Raw max probability is tiny (0.5% for 721 classes). Instead, use how much
    # the top prediction stands out relative to a uniform baseline (1/N).
    n_classes = len(probabilities)
    baseline = 1.0 / n_classes  # ~0.14% for 721 classes
    top_prob = float(np.max(probabilities))

    # Ratio: how many times better than random. Cap at 100.
    # A ratio of 1x = random (low confidence), 50x+ = very confident
    ratio = top_prob / baseline if baseline > 0 else 1.0

    # Also factor in separation between top-1 and top-2
    sorted_probs = np.sort(probabilities)[::-1]
    top2_prob = float(sorted_probs[1]) if len(sorted_probs) > 1 else 0.0
    separation = (top_prob - top2_prob) / (top_prob + 1e-10)

    # Combine: ratio gives base confidence, separation boosts it
    # ratio of 10x → ~50%, 30x → ~75%, 100x+ → ~90%+
    ratio_score = min(np.log1p(ratio) / np.log1p(100) * 85, 85)
    separation_bonus = separation * 15  # up to 15% bonus for clear separation
    disease_confidence = int(min(max(ratio_score + separation_bonus, 5), 99))

    # Get top 3 diseases with rescaled probabilities for display
    top_indices = np.argsort(probabilities)[-3:][::-1]
    top_probs = probabilities[top_indices]
    # Rescale top 3 to sum to ~100% for meaningful display
    top_sum = top_probs.sum()
    top_diseases = [
        {
            "disease": label_encoder.inverse_transform([idx])[0],
            "probability": round(float(probabilities[idx] / top_sum * 100), 1) if top_sum > 0 else 0.0,
        }
        for idx in top_indices
    ]

    return {
        "predicted_disease": predicted_disease,
        "disease_confidence": disease_confidence,
        "top_diseases": top_diseases,
    }


def get_symptom_columns() -> list[str]:
    """Return the list of symptom column names used by the model."""
    _, _, symptom_columns = get_model()
    return symptom_columns
