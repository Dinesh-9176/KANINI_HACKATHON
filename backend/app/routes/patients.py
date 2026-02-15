"""Patient, dashboard, and department data endpoints."""

from fastapi import APIRouter, HTTPException
from app.db.supabase_client import table_select, table_select_one, table_update

router = APIRouter()


@router.get("/patients")
async def get_patients():
    """Fetch all patients with triage info from the v_triage_queue view."""
    rows = table_select("v_triage_queue", {
        "select": "*",
        "order": "triage_time.desc",
    })
    return rows


@router.get("/patients/{patient_code}")
async def get_patient(patient_code: str):
    """Fetch a single patient with full details including intake and triage."""
    # Get patient
    patient = table_select_one("patients", {
        "patient_code": f"eq.{patient_code}",
    })
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    pid = patient["id"]

    # Get intake data
    intake = table_select_one("patient_intakes", {
        "patient_id": f"eq.{pid}",
        "order": "created_at.desc",
        "limit": "1",
    })

    # Get latest triage result
    triage = table_select_one("triage_results", {
        "patient_id": f"eq.{pid}",
        "order": "created_at.desc",
        "limit": "1",
    })

    # Get contributing factors
    factors = []
    if triage:
        factors = table_select("contributing_factors", {
            "triage_id": f"eq.{triage['id']}",
            "order": "sort_order.asc",
        })

    # Get department name
    dept_name = "General Medicine"
    if triage and triage.get("department_id"):
        dept = table_select_one("departments", {
            "id": f"eq.{triage['department_id']}",
        })
        if dept:
            dept_name = dept["name"]

    return {
        "patient": patient,
        "intake": intake,
        "triage": triage,
        "contributing_factors": factors,
        "department_name": dept_name,
    }


@router.patch("/patients/{patient_code}/status")
async def update_patient_status(patient_code: str, body: dict):
    """Update a patient's status (e.g., waiting -> attended -> discharged)."""
    status = body.get("status")
    if status not in ("waiting", "attended", "discharged", "transferred"):
        raise HTTPException(status_code=400, detail="Invalid status")

    result = table_update(
        "patients",
        {"patient_code": f"eq.{patient_code}"},
        {"status": status},
    )
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result[0]


@router.get("/dashboard")
async def get_dashboard():
    """Fetch dashboard KPIs, risk distribution, and department load."""
    kpis = table_select("v_dashboard_kpis")
    risk_dist = table_select("v_risk_distribution")
    dept_load = table_select("v_department_load")

    return {
        "kpis": kpis[0] if kpis else {
            "total_patients_today": 0,
            "high_risk_count": 0,
            "avg_waiting_time": 0,
            "active_alerts": 0,
        },
        "risk_distribution": risk_dist,
        "department_load": dept_load,
    }


@router.get("/departments")
async def get_departments():
    """Fetch all departments with live status."""
    # Try view with snapshot data first
    rows = table_select("v_department_status", {
        "order": "is_emergency.desc,name.asc",
    })
    if rows:
        return rows

    # Fallback to basic departments table if no snapshots exist
    rows = table_select("departments", {
        "select": "id,name,description,icon,total_beds,is_emergency,is_active",
        "is_active": "eq.true",
        "order": "is_emergency.desc,name.asc",
    })
    return rows
