"""SQLAlchemy models matching the schema."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    total_beds = Column(Integer, default=0)
    is_emergency = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    status = Column(String, default="waiting")  # waiting, triage, in_treatment, admitted, discharged
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    intakes = relationship("PatientIntake", back_populates="patient")
    triage_results = relationship("TriageResult", back_populates="patient")

class PatientIntake(Base):
    __tablename__ = "patient_intakes"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"))
    
    # Vitals
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    heart_rate = Column(Integer)
    temperature = Column(Float)
    oxygen_saturation = Column(Integer)
    respiratory_rate = Column(Integer)
    
    # Clinical (Stored as JSON or simple strings for sqlite)
    symptoms = Column(JSON, default=list) 
    conditions = Column(JSON, default=list)
    notes = Column(Text, default="")
    
    intake_method = Column(String, default="manual")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="intakes")
    triage_result = relationship("TriageResult", back_populates="intake", uselist=False)

class TriageResult(Base):
    __tablename__ = "triage_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"))
    intake_id = Column(String, ForeignKey("patient_intakes.id"))
    
    risk_level = Column(String, nullable=False) # high, medium, low
    priority_score = Column(Integer, nullable=False)
    triage_level = Column(Integer)
    confidence = Column(Integer, nullable=False)
    predicted_disease = Column(String)
    department_id = Column(String, ForeignKey("departments.id"))
    
    waiting_time = Column(Integer, default=0)
    attended_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="triage_results")
    intake = relationship("PatientIntake", back_populates="triage_result")
    department = relationship("Department")
    contributing_factors = relationship("ContributingFactor", back_populates="triage_result")

class ContributingFactor(Base):
    __tablename__ = "contributing_factors"

    id = Column(String, primary_key=True, default=generate_uuid)
    triage_id = Column(String, ForeignKey("triage_results.id"))
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    impact = Column(Integer, nullable=False)
    is_positive = Column(Boolean, nullable=False)

    triage_result = relationship("TriageResult", back_populates="contributing_factors")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    message = Column(String, nullable=False)
    alert_type = Column(String, nullable=False) # critical, warning, info
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
