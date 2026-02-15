-- Feature 4: Lab & Bed Allocation Tables

-- 1. Beds Table
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id TEXT NOT NULL,
    bed_number TEXT NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    current_patient_id UUID REFERENCES patients(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bed Assignments (History)
CREATE TABLE bed_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID REFERENCES beds(id),
    patient_id UUID REFERENCES patients(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discharged_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 3. Labs
CREATE TABLE labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'pathology', 'radiology', etc.
    is_available BOOLEAN DEFAULT TRUE,
    next_available_slot TIMESTAMP WITH TIME ZONE
);

-- 4. Lab Bookings
CREATE TABLE lab_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES labs(id),
    patient_id UUID REFERENCES patients(id),
    booking_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    result_summary TEXT
);

-- 5. Seed some initial data
INSERT INTO beds (department_id, bed_number, is_occupied) VALUES
('emergency', 'ER-01', FALSE),
('emergency', 'ER-02', TRUE), -- Simulate one occupied
('cardiology', 'CARD-01', FALSE),
('cardiology', 'CARD-02', FALSE),
('general', 'GEN-01', FALSE),
('general', 'GEN-02', FALSE);

INSERT INTO labs (name, type) VALUES
('General Pathology', 'pathology'),
('X-Ray Room 1', 'radiology'),
('MRI Scanner', 'radiology'),
('Blood Bank', 'pathology');

-- 6. Create View for Department Status (Simulating capacity)
-- This view aggregates bed usage per department
DROP VIEW IF EXISTS v_department_status;
CREATE OR REPLACE VIEW v_department_status AS
SELECT 
    d.id,
    d.name,
    d.description,
    d.total_beds,
    d.is_emergency,
    d.is_active,
    COUNT(b.id) FILTER (WHERE b.is_occupied) as occupied_beds,
    CASE 
        WHEN d.total_beds > 0 THEN ROUND((COUNT(b.id) FILTER (WHERE b.is_occupied)::decimal / d.total_beds) * 100, 0)
        ELSE 0 
    END as capacity_pct,
    -- Simple random wait time logic for demo (since we don't have real queueing model in DB yet)
    CASE 
        WHEN d.is_emergency THEN 5 + (COUNT(b.id) FILTER (WHERE b.is_occupied) * 2)
        ELSE 15 + (COUNT(b.id) FILTER (WHERE b.is_occupied) * 5)
    END as wait_time_mins,
    -- Dummy active doctors for now (Simulated)
    FLOOR(RANDOM() * 5 + 2)::int as active_doctors
FROM departments d
LEFT JOIN beds b ON d.id = b.department_id
GROUP BY d.id;
