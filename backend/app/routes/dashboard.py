"""Dashboard API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import sql_models
from datetime import datetime, date

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregated stats for the dashboard."""
    
    # Calculate start of today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Total Patients Today
    total_patients = db.query(sql_models.TriageResult).filter(
        sql_models.TriageResult.created_at >= today_start
    ).count()
    
    # Risk Counts
    high_risk = db.query(sql_models.TriageResult).filter(
        sql_models.TriageResult.created_at >= today_start,
        sql_models.TriageResult.risk_level == "high"
    ).count()
    
    # Avg Wait Time (Mock calculation or real average)
    avg_wait = db.query(func.avg(sql_models.TriageResult.waiting_time)).filter(
        sql_models.TriageResult.created_at >= today_start
    ).scalar() or 0
    
    return {
        "total_patients": total_patients,
        "high_risk": high_risk,
        "avg_wait": int(avg_wait),
        "department_load": 84  # Mock for now
    }

@router.get("/dashboard/risks")
async def get_risk_distribution(db: Session = Depends(get_db)):
    """Get risk distribution for today."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    results = db.query(
        sql_models.TriageResult.risk_level, 
        func.count(sql_models.TriageResult.id)
    ).filter(
        sql_models.TriageResult.created_at >= today_start
    ).group_by(sql_models.TriageResult.risk_level).all()
    
    # Format for Recharts
    risk_map = {r[0]: r[1] for r in results}
    
    return [
        {"name": "High", "value": risk_map.get("high", 0), "color": "#ef4444"},
        {"name": "Medium", "value": risk_map.get("medium", 0), "color": "#f97316"},
        {"name": "Low", "value": risk_map.get("low", 0), "color": "#22c55e"},
    ]

@router.get("/dashboard/departments")
async def get_department_load(db: Session = Depends(get_db)):
    """Get patient count by department."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    results = db.query(
        sql_models.Department.name,
        func.count(sql_models.TriageResult.id)
    ).join(
        sql_models.TriageResult, 
        sql_models.Department.id == sql_models.TriageResult.department_id
    ).filter(
        sql_models.TriageResult.created_at >= today_start
    ).group_by(sql_models.Department.name).all()
    
    return [
        {"name": row[0], "patients": row[1]} 
        for row in results
    ]

@router.get("/dashboard/alerts")
async def get_alerts(db: Session = Depends(get_db)):
    """Get active alerts."""
    alerts = db.query(sql_models.Alert).filter(
        sql_models.Alert.is_resolved == False
    ).limit(5).all()
    
    return [
        {
            "id": a.id,
            "message": a.message,
            "type": a.alert_type,
            "time": "Just now" # simplified
        }
        for a in alerts
    ]
