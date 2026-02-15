
def predict_los(risk_level: str, predicted_disease: str, age: int, vitals: dict) -> dict:
    """
    Predict Length of Stay (LOS) based on heuristic rules.
    """
    days = 0
    confidence = 1.0  # Start with high confidence

    # 1. Base days by risk level
    if risk_level.lower() == "high":
        days += 7
    elif risk_level.lower() == "medium":
        days += 3
    else:
        days += 1

    # 2. Disease modifiers
    disease_lower = predicted_disease.lower()
    if any(k in disease_lower for k in ["cardiac", "heart", "myocardial", "stroke", "neuro"]):
        days += 3
    elif any(k in disease_lower for k in ["pneumonia", "asthma", "copd", "respiratory", "lung"]):
        days += 2
    elif any(k in disease_lower for k in ["infection", "sepsis", "viral", "bacterial", "covid"]):
        days += 1
    elif any(k in disease_lower for k in ["rash", "dermatitis", "acne", "ent", "ear", "nose", "throat"]):
        days = max(1, days - 1) # Reduce stay for minor issues, but min 1 day

    # 3. Age modifier
    if age > 60:
        extra_days = (age - 60) // 10
        days += extra_days

    # 4. Vitals severity penalties
    # Heart Rate
    try:
        hr_val = vitals.get("heart_rate") or vitals.get("hr", 75)
        hr = int(float(hr_val)) # Handle "98.0" strings
    except:
        hr = 75

    if not (60 <= hr <= 100):
        days += 1
        confidence -= 0.1

    # Blood Pressure (Systolic)
    bp = vitals.get("blood_pressure") or vitals.get("bp", "120/80")
    try:
        systolic = int(str(bp).split("/")[0])
        if systolic > 140 or systolic < 90:
            days += 1
            confidence -= 0.1
    except:
        pass

    # SpO2
    try:
        spo2_val = vitals.get("oxygen_saturation") or vitals.get("spo2", 98)
        spo2 = int(float(spo2_val))
    except:
        spo2 = 98

    if spo2 < 95:
        days += 2
        confidence -= 0.2

    # Temperature
    try:
        temp_val = vitals.get("temperature") or vitals.get("temp", 98.6)
        temp = float(temp_val)
    except:
        temp = 98.6

    if temp > 100.4 or temp < 96.0:
        days += 1

    return {
        "estimated_los_days": int(days),
        "los_confidence": round(max(0.1, min(1.0, confidence)), 2)
    }
