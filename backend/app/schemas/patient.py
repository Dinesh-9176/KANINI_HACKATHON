from pydantic import BaseModel
from typing import Optional


class PatientIntakeRequest(BaseModel):
    name: str
    age: int
    gender: str
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None  # in °F
    oxygen_saturation: Optional[int] = None
    respiratory_rate: Optional[int] = None
    symptoms: list[str] = []
    conditions: list[str] = []
    notes: str = ""


class ContributingFactor(BaseModel):
    name: str
    value: str
    impact: int  # 0-100
    isPositive: bool


class TopDisease(BaseModel):
    disease: str
    probability: float


class TriageResponse(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    risk_level: str  # "high", "medium", "low"
    priority_score: int  # 0-100
    department: str
    confidence: int  # 0-100
    predicted_disease: str
    top_diseases: list[TopDisease] = []
    contributing_factors: list[ContributingFactor]
    waiting_time: int  # estimated minutes
    estimated_los_days: int  # AI predicted length of stay
    los_confidence: float  # 0.0 - 1.0
    vitals: dict  # pass back the vitals for display
