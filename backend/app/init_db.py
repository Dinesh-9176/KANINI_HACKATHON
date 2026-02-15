"""Initialize the database with tables and seed data."""

from app.database import engine, SessionLocal
from app.models import sql_models

def init_db():
    sql_models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if departments exist
    if db.query(sql_models.Department).count() == 0:
        # Seed Departments
        departments = [
            sql_models.Department(id="emergency", name="Emergency", description="Critical care & trauma", icon="Ambulance", total_beds=20, is_emergency=True),
            sql_models.Department(id="cardiology", name="Cardiology", description="Heart & cardiovascular", icon="Heart", total_beds=45),
            sql_models.Department(id="neurology", name="Neurology", description="Brain & nervous system", icon="Brain", total_beds=30),
            sql_models.Department(id="orthopedics", name="Orthopedics", description="Bones, joints & muscles", icon="Bone", total_beds=35),
            sql_models.Department(id="general", name="General Medicine", description="Internal medicine", icon="Stethoscope", total_beds=50),
            sql_models.Department(id="pediatrics_geriatrics", name="Pediatrics / Geriatrics", description="Age-specific care", icon="Users", total_beds=45),
            sql_models.Department(id="pulmonology", name="Pulmonology", description="Respiratory & lungs", icon="Wind", total_beds=25),
        ]
        db.add_all(departments)
        
        # Seed Mock Alerts
        alerts = [
            sql_models.Alert(message="ER Capacity at 95%", alert_type="critical"),
            sql_models.Alert(message="Dr. Smith unavailable for Cardio", alert_type="warning"),
        ]
        db.add_all(alerts)
        
        db.commit()
    
    db.close()

if __name__ == "__main__":
    print("Creating tables...")
    init_db()
    print("Tables created.")
