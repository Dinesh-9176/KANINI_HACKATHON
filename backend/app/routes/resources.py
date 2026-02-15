"""Resources API: Beds & Labs."""

from fastapi import APIRouter, HTTPException
from app.db.supabase_client import table_select, table_select_one, table_insert, table_update

router = APIRouter()

# --- Beds ---

@router.get("/beds")
async def get_beds(department_id: str = None):
    """List beds, optionally filtered by department."""
    params = {"order": "bed_number.asc"}
    if department_id:
        params["department_id"] = f"eq.{department_id}"
    
    return table_select("beds", params)

@router.post("/beds/assign")
async def assign_bed(body: dict):
    """Assign a patient to a bed."""
    bed_id = body.get("bed_id")
    patient_id = body.get("patient_id")
    
    if not bed_id or not patient_id:
        raise HTTPException(status_code=400, detail="bed_id and patient_id required")

    # 1. Update bed status
    bed = table_update("beds", {"id": f"eq.{bed_id}"}, {
        "is_occupied": True,
        "current_patient_id": patient_id
    })
    
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    # 2. Add to history
    table_insert("bed_assignments", {
        "bed_id": bed_id,
        "patient_id": patient_id
    })
    
    return {"status": "assigned", "bed": bed[0]}

# --- Labs ---

@router.get("/labs")
async def get_labs():
    """List all labs and their availability."""
    return table_select("labs", {"order": "name.asc"})

@router.post("/labs/book")
async def book_lab(body: dict):
    """Book a lab test."""
    lab_id = body.get("lab_id")
    patient_id = body.get("patient_id")
    
    if not lab_id or not patient_id:
        raise HTTPException(status_code=400, detail="lab_id and patient_id required")

    booking = table_insert("lab_bookings", {
        "lab_id": lab_id,
        "patient_id": patient_id,
        "status": "pending"
    })
    
    return {"status": "booked", "booking": booking}
