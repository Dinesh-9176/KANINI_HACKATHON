"""Transform intake form data into model-ready features."""

import numpy as np

# Map intake form symptom names to dataset column names
SYMPTOM_MAPPING = {
    "Chest Pain": "sharp chest pain",
    "Shortness of Breath": "shortness of breath",
    "Fever": "fever",
    "Cough": "cough",
    "Headache": "headache",
    "Dizziness": "dizziness",
    "Nausea": "nausea",
    "Abdominal Pain": "sharp abdominal pain",
    "Back Pain": "back pain",
    "Joint Pain": "joint pain",
    "Fatigue": "fatigue",
    "Weight Loss": "recent weight loss",
    "Vision Problems": "diminished vision",
    "Numbness": "paresthesia",
    "Seizures": "seizures",
    "Bleeding": "nosebleed",
    "Swelling": "peripheral edema",
    "Skin Rash": "skin rash",
    "Difficulty Swallowing": "difficulty in swallowing",
    "Anxiety": "anxiety and nervousness",
}

# Normal vital sign ranges for contributing factor analysis
VITAL_RANGES = {
    "heart_rate": {"low": 60, "high": 100, "unit": "bpm", "name": "Heart Rate"},
    "blood_pressure_systolic": {"low": 90, "high": 140, "unit": "mmHg", "name": "Blood Pressure (Systolic)"},
    "blood_pressure_diastolic": {"low": 60, "high": 90, "unit": "mmHg", "name": "Blood Pressure (Diastolic)"},
    "temperature_f": {"low": 97.0, "high": 99.5, "unit": "°F", "name": "Temperature"},
    "oxygen_saturation": {"low": 95, "high": 100, "unit": "%", "name": "Oxygen Saturation (SpO2)"},
    "respiratory_rate": {"low": 12, "high": 20, "unit": "/min", "name": "Respiratory Rate"},
}


def fahrenheit_to_celsius(temp_f: float) -> float:
    """Convert Fahrenheit to Celsius."""
    return (temp_f - 32) * 5 / 9


def prepare_triage_features(
    age: int,
    heart_rate: int | None,
    systolic_bp: int | None,
    oxygen_saturation: int | None,
    temperature_f: float | None,
    chronic_disease_count: int,
) -> np.ndarray:
    """Prepare features for the triage level model.

    Feature order must match training: [age, heart_rate, systolic_blood_pressure,
    oxygen_saturation, body_temperature, chronic_disease_count]

    NOTE: pain_level was removed - it had 84.8% feature importance,
    making the model useless when we send 0 at inference.
    """
    # Convert temperature to Celsius (dataset uses Celsius)
    temp_c = fahrenheit_to_celsius(temperature_f) if temperature_f else 37.0

    # Use sensible defaults for missing vitals
    features = [
        age,
        heart_rate or 75,
        systolic_bp or 120,
        oxygen_saturation or 98,
        temp_c,
        chronic_disease_count,
    ]
    return np.array(features).reshape(1, -1)


def prepare_symptom_features(symptoms: list[str], symptom_columns: list[str]) -> np.ndarray:
    """Convert symptom list to binary feature vector matching dataset columns."""
    feature_vector = np.zeros(len(symptom_columns))

    for symptom in symptoms:
        mapped_name = SYMPTOM_MAPPING.get(symptom, symptom.lower())
        # Find matching column (exact or partial match)
        for i, col in enumerate(symptom_columns):
            if mapped_name == col or mapped_name in col or col in mapped_name:
                feature_vector[i] = 1
                break

    return feature_vector.reshape(1, -1)


def compute_contributing_factors(
    heart_rate: int | None,
    systolic_bp: int | None,
    diastolic_bp: int | None,
    temperature_f: float | None,
    oxygen_saturation: int | None,
    respiratory_rate: int | None,
    age: int,
    feature_importances: dict[str, float] | None = None,
) -> list[dict]:
    """Compute contributing factors with impact scores for the UI."""
    factors = []

    vitals = {
        "heart_rate": heart_rate,
        "blood_pressure_systolic": systolic_bp,
        "blood_pressure_diastolic": diastolic_bp,
        "temperature_f": temperature_f,
        "oxygen_saturation": oxygen_saturation,
        "respiratory_rate": respiratory_rate,
    }

    for key, value in vitals.items():
        if value is None:
            continue

        ranges = VITAL_RANGES.get(key)
        if not ranges:
            continue

        # Calculate how far the vital is from normal range
        if value < ranges["low"]:
            deviation = (ranges["low"] - value) / ranges["low"]
            is_positive = False
        elif value > ranges["high"]:
            deviation = (value - ranges["high"]) / ranges["high"]
            is_positive = False
        else:
            # Within normal range
            deviation = 0
            is_positive = True

        # Impact as percentage (capped at 100)
        impact = min(int(deviation * 100 + 10), 100) if not is_positive else max(int((1 - deviation) * 15), 5)

        # Format display value
        if key == "blood_pressure_systolic" and diastolic_bp:
            display_value = f"{value}/{diastolic_bp} {ranges['unit']}"
        elif key == "blood_pressure_diastolic":
            continue  # Already displayed with systolic
        else:
            display_value = f"{value} {ranges['unit']}"

        factors.append({
            "name": ranges["name"],
            "value": display_value,
            "impact": impact,
            "isPositive": is_positive,
        })

    # Add age factor
    age_impact = min(int(age / 2), 50) if age > 50 else max(int(age / 5), 5)
    factors.append({
        "name": "Age Factor",
        "value": f"{age} years",
        "impact": age_impact,
        "isPositive": age < 60,
    })

    # Sort by impact descending
    factors.sort(key=lambda x: x["impact"], reverse=True)

    return factors[:6]  # Return top 6 factors
