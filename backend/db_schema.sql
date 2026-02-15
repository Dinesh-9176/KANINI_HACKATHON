-- ============================================================
-- MediCare AI Triage System - Full Database Schema (PostgreSQL)
-- ============================================================

-- ============================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,          -- "Dr. Smith"
    role            VARCHAR(50) NOT NULL DEFAULT 'doctor',  -- doctor, nurse, admin, receptionist
    title           VARCHAR(100),                   -- "Chief Medical Officer"
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    dark_mode       BOOLEAN DEFAULT FALSE,
    risk_threshold  INTEGER DEFAULT 85,             -- AI risk alert threshold (0-100)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. NOTIFICATION PREFERENCES
-- ============================================================

CREATE TABLE notification_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    critical_alerts     BOOLEAN DEFAULT TRUE,
    dept_overload       BOOLEAN DEFAULT TRUE,
    email_digest        BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- 3. DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    id              VARCHAR(50) PRIMARY KEY,        -- "cardiology", "emergency", etc.
    name            VARCHAR(100) NOT NULL,           -- "Cardiology"
    description     VARCHAR(255),                    -- "Heart & cardiovascular"
    icon            VARCHAR(50),                     -- "Heart", "Brain", etc. (lucide icon name)
    total_beds      INTEGER NOT NULL DEFAULT 0,      -- total bed capacity
    is_emergency    BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 4. DOCTORS
-- ============================================================

CREATE TABLE doctors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),       -- link to user account if they have one
    name            VARCHAR(100) NOT NULL,
    specialization  VARCHAR(100),
    department_id   VARCHAR(50) NOT NULL REFERENCES departments(id),
    is_available    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. PATIENTS (core patient record)
-- ============================================================

CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code    VARCHAR(20) UNIQUE NOT NULL,     -- "P-1024" (display ID)
    name            VARCHAR(100) NOT NULL,
    age             INTEGER NOT NULL,
    gender          VARCHAR(20) NOT NULL,            -- male, female, other, prefer-not
    status          VARCHAR(30) NOT NULL DEFAULT 'waiting',  -- waiting, triage, in_treatment, admitted, discharged
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. PATIENT INTAKE (form submission data)
-- ============================================================

CREATE TABLE patient_intakes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    -- Vitals
    blood_pressure_systolic     INTEGER,
    blood_pressure_diastolic    INTEGER,
    heart_rate                  INTEGER,
    temperature                 FLOAT,              -- stored in °F
    oxygen_saturation           INTEGER,
    respiratory_rate            INTEGER,

    -- Clinical
    symptoms                TEXT[] NOT NULL DEFAULT '{}',   -- ["Chest Pain", "Fever"]
    conditions              TEXT[] NOT NULL DEFAULT '{}',   -- ["Diabetes", "Hypertension"]
    notes                   TEXT DEFAULT '',

    -- Intake metadata
    intake_method           VARCHAR(20) DEFAULT 'manual',  -- manual, ehr_upload
    uploaded_file_url       VARCHAR(500),                   -- EHR/EMR PDF path if uploaded
    submitted_by            UUID REFERENCES users(id),      -- which user submitted
    created_at              TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 7. TRIAGE RESULTS (AI model output per patient)
-- ============================================================

CREATE TABLE triage_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    intake_id           UUID NOT NULL REFERENCES patient_intakes(id) ON DELETE CASCADE,

    -- Model outputs
    risk_level          VARCHAR(10) NOT NULL,         -- "high", "medium", "low"
    priority_score      INTEGER NOT NULL,             -- 0-100
    triage_level        INTEGER,                      -- raw model output: 0-3
    confidence          INTEGER NOT NULL,             -- 0-100 (combined confidence)
    predicted_disease   VARCHAR(200),
    department_id       VARCHAR(50) REFERENCES departments(id),

    -- Timing
    waiting_time        INTEGER DEFAULT 0,            -- estimated wait in minutes
    arrival_time        TIMESTAMP DEFAULT NOW(),
    attended_at         TIMESTAMP,                    -- when marked attended
    discharged_at       TIMESTAMP,

    -- Actions taken
    is_escalated        BOOLEAN DEFAULT FALSE,
    transferred_to      VARCHAR(50) REFERENCES departments(id),

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. CONTRIBUTING FACTORS (AI explainability per triage)
-- ============================================================

CREATE TABLE contributing_factors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triage_id       UUID NOT NULL REFERENCES triage_results(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,           -- "Heart Rate"
    value           VARCHAR(100) NOT NULL,           -- "130 bpm"
    impact          INTEGER NOT NULL,                -- 0-100
    is_positive     BOOLEAN NOT NULL,                -- green vs red indicator
    sort_order      INTEGER DEFAULT 0
);

-- ============================================================
-- 9. ALERTS (real-time hospital alerts)
-- ============================================================

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message         VARCHAR(500) NOT NULL,           -- "ER Capacity at 95%"
    alert_type      VARCHAR(20) NOT NULL,            -- "critical", "warning", "info"
    is_read         BOOLEAN DEFAULT FALSE,
    is_resolved     BOOLEAN DEFAULT FALSE,
    created_by      UUID REFERENCES users(id),
    resolved_by     UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    resolved_at     TIMESTAMP
);

-- ============================================================
-- 10. DEPARTMENT SNAPSHOTS (periodic capacity tracking)
-- ============================================================

CREATE TABLE department_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   VARCHAR(50) NOT NULL REFERENCES departments(id),
    occupied_beds   INTEGER NOT NULL DEFAULT 0,
    capacity_pct    INTEGER NOT NULL DEFAULT 0,      -- 0-100
    wait_time_mins  INTEGER NOT NULL DEFAULT 0,      -- current avg wait
    active_doctors  INTEGER NOT NULL DEFAULT 0,
    patient_count   INTEGER NOT NULL DEFAULT 0,      -- current patients in dept
    recorded_at     TIMESTAMP DEFAULT NOW()
);

-- Index for quick latest-snapshot lookups
CREATE INDEX idx_dept_snapshot_dept_time ON department_snapshots(department_id, recorded_at DESC);

-- ============================================================
-- 11. HOURLY STATS (for dashboard & analytics charts)
-- ============================================================

CREATE TABLE hourly_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date       DATE NOT NULL,
    stat_hour       INTEGER NOT NULL,                -- 0-23
    total_patients  INTEGER DEFAULT 0,
    high_risk       INTEGER DEFAULT 0,
    medium_risk     INTEGER DEFAULT 0,
    low_risk        INTEGER DEFAULT 0,
    avg_wait_time   FLOAT DEFAULT 0,
    recorded_at     TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date, stat_hour)
);

-- ============================================================
-- 12. DAILY STATS (for trend analytics)
-- ============================================================

CREATE TABLE daily_stats (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date           DATE UNIQUE NOT NULL,
    total_patients      INTEGER DEFAULT 0,
    high_risk_count     INTEGER DEFAULT 0,
    medium_risk_count   INTEGER DEFAULT 0,
    low_risk_count      INTEGER DEFAULT 0,
    avg_wait_time       FLOAT DEFAULT 0,             -- minutes
    avg_priority_score  FLOAT DEFAULT 0,
    total_discharged    INTEGER DEFAULT 0,
    total_escalated     INTEGER DEFAULT 0,
    total_transferred   INTEGER DEFAULT 0,
    recorded_at         TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 13. DEPARTMENT PERFORMANCE (for analytics)
-- ============================================================

CREATE TABLE department_performance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   VARCHAR(50) NOT NULL REFERENCES departments(id),
    stat_date       DATE NOT NULL,
    efficiency_pct  FLOAT DEFAULT 0,                 -- treatment efficiency %
    satisfaction    FLOAT DEFAULT 0,                 -- patient satisfaction 0-5
    patients_seen   INTEGER DEFAULT 0,
    avg_treatment_time  FLOAT DEFAULT 0,             -- minutes
    recorded_at     TIMESTAMP DEFAULT NOW(),
    UNIQUE(department_id, stat_date)
);

-- ============================================================
-- 14. AI MODEL METRICS (track model performance over time)
-- ============================================================

CREATE TABLE ai_model_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name      VARCHAR(100) NOT NULL,           -- "triage_model_v1", "disease_model_v1"
    model_version   VARCHAR(50) NOT NULL,            -- "2.4"
    accuracy        FLOAT,
    precision_score FLOAT,
    recall          FLOAT,
    f1_score        FLOAT,
    specificity     FLOAT,
    auc_score       FLOAT,
    total_predictions   INTEGER DEFAULT 0,
    recorded_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 15. SYMPTOM & CONDITION REFERENCE DATA
-- ============================================================

CREATE TABLE ref_symptoms (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,     -- "Chest Pain"
    mapped_column   VARCHAR(200),                     -- "sharp chest pain" (dataset column)
    category        VARCHAR(50),                      -- "cardiac", "respiratory", etc.
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE ref_conditions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,     -- "Diabetes"
    category        VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 16. AUDIT LOG (track who did what)
-- ============================================================

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,             -- "intake_submit", "mark_attended", "escalate", "transfer"
    entity_type     VARCHAR(50) NOT NULL,             -- "patient", "triage_result", "department"
    entity_id       UUID,
    details         JSONB,                            -- additional context
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- ============================================================
-- SEED DATA: DEPARTMENTS
-- ============================================================

INSERT INTO departments (id, name, description, icon, total_beds, is_emergency, is_active) VALUES
('emergency',       'Emergency',            'Critical care & trauma',       'Ambulance',    20,  TRUE,  TRUE),
('cardiology',      'Cardiology',           'Heart & cardiovascular',       'Heart',        45,  FALSE, TRUE),
('neurology',       'Neurology',            'Brain & nervous system',       'Brain',        30,  FALSE, TRUE),
('orthopedics',     'Orthopedics',          'Bones, joints & muscles',      'Bone',         35,  FALSE, TRUE),
('general',         'General Medicine',     'Internal medicine',            'Stethoscope',  50,  FALSE, TRUE),
('pediatrics',      'Pediatrics',           'Child healthcare',             'Baby',         30,  FALSE, TRUE),
('ophthalmology',   'Ophthalmology',        'Eye care & surgery',           'Eye',          15,  FALSE, TRUE),
('pulmonology',     'Pulmonology',          'Respiratory & lungs',          'Wind',         25,  FALSE, TRUE),
('dermatology',     'Dermatology',          'Skin conditions',              'Layers',       10,  FALSE, TRUE),
('gastroenterology','Gastroenterology',     'Digestive system',             'Utensils',     20,  FALSE, TRUE),
('ent',             'ENT',                  'Ear, nose & throat',           'Ear',          15,  FALSE, TRUE),
('nephrology',      'Nephrology',           'Kidney & urinary',             'Droplet',      15,  FALSE, TRUE),
('oncology',        'Oncology',             'Cancer treatment',             'Radiation',    25,  FALSE, TRUE),
('endocrinology',   'Endocrinology',        'Hormones & metabolism',        'Pill',         10,  FALSE, TRUE),
('psychiatry',      'Psychiatry',           'Mental health',                'BrainCircuit', 20,  FALSE, TRUE),
('urology',         'Urology',             'Urinary & male reproductive',  'Activity',     15,  FALSE, TRUE),
('gynecology',      'Gynecology',           'Female reproductive health',   'Heart',        20,  FALSE, TRUE),
('hematology',      'Hematology',           'Blood disorders',              'Droplets',     10,  FALSE, TRUE),
('infectious-disease','Infectious Disease', 'Infectious conditions',        'Bug',          20,  FALSE, TRUE),
('rheumatology',    'Rheumatology',         'Autoimmune & joint diseases',  'Bone',         10,  FALSE, TRUE);

-- ============================================================
-- SEED DATA: REFERENCE SYMPTOMS
-- ============================================================

INSERT INTO ref_symptoms (name, mapped_column, category) VALUES
('Chest Pain',              'sharp chest pain',             'cardiac'),
('Shortness of Breath',     'shortness of breath',          'respiratory'),
('Fever',                   'fever',                        'general'),
('Cough',                   'cough',                        'respiratory'),
('Headache',                'headache',                     'neurological'),
('Dizziness',               'dizziness',                    'neurological'),
('Nausea',                  'nausea',                       'gastrointestinal'),
('Abdominal Pain',          'sharp abdominal pain',         'gastrointestinal'),
('Back Pain',               'back pain',                    'musculoskeletal'),
('Joint Pain',              'joint pain',                   'musculoskeletal'),
('Fatigue',                 'fatigue',                      'general'),
('Weight Loss',             'recent weight loss',           'general'),
('Vision Problems',         'diminished vision',            'ophthalmological'),
('Numbness',                'paresthesia',                  'neurological'),
('Seizures',                'seizures',                     'neurological'),
('Bleeding',                'nosebleed',                    'general'),
('Swelling',                'peripheral edema',             'cardiovascular'),
('Skin Rash',               'skin rash',                    'dermatological'),
('Difficulty Swallowing',   'difficulty in swallowing',     'ent'),
('Anxiety',                 'anxiety and nervousness',      'psychiatric');

-- ============================================================
-- SEED DATA: REFERENCE CONDITIONS
-- ============================================================

INSERT INTO ref_conditions (name, category) VALUES
('Diabetes',            'endocrine'),
('Hypertension',        'cardiovascular'),
('Heart Disease',       'cardiovascular'),
('Asthma',              'respiratory'),
('COPD',                'respiratory'),
('Cancer',              'oncology'),
('Kidney Disease',      'nephrology'),
('Liver Disease',       'gastroenterology'),
('Stroke History',      'neurological'),
('Arthritis',           'rheumatology'),
('Thyroid Disorder',    'endocrine'),
('Depression/Anxiety',  'psychiatric'),
('None',                'none');

-- ============================================================
-- SEED DATA: AI MODEL METRICS (from training results)
-- ============================================================

INSERT INTO ai_model_metrics (model_name, model_version, accuracy, precision_score, recall, f1_score, specificity, auc_score, total_predictions) VALUES
('triage_model',    '1.0',  0.93, 0.92, 0.92, 0.92, 0.97, 0.96, 18000),
('disease_model',   '1.0',  0.76, 0.75, 0.76, 0.75, 0.99, 0.89, 246926);

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Dashboard KPIs: today's summary
CREATE VIEW v_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM triage_results WHERE DATE(created_at) = CURRENT_DATE) AS total_patients_today,
    (SELECT COUNT(*) FROM triage_results WHERE DATE(created_at) = CURRENT_DATE AND risk_level = 'high') AS high_risk_count,
    (SELECT COALESCE(AVG(waiting_time), 0) FROM triage_results WHERE DATE(created_at) = CURRENT_DATE AND attended_at IS NULL) AS avg_waiting_time,
    (SELECT COUNT(*) FROM alerts WHERE is_resolved = FALSE) AS active_alerts;

-- Active patients in triage queue
CREATE VIEW v_triage_queue AS
SELECT
    p.id,
    p.patient_code,
    p.name,
    p.age,
    p.gender,
    p.status,
    tr.risk_level,
    tr.priority_score,
    tr.confidence,
    tr.predicted_disease,
    tr.waiting_time,
    tr.department_id,
    d.name AS department_name,
    tr.created_at AS triage_time
FROM patients p
JOIN triage_results tr ON tr.patient_id = p.id
JOIN departments d ON d.id = tr.department_id
WHERE p.status IN ('waiting', 'triage')
ORDER BY tr.priority_score DESC;

-- Department capacity overview (latest snapshot per dept)
CREATE VIEW v_department_status AS
SELECT DISTINCT ON (ds.department_id)
    d.id,
    d.name,
    d.description,
    d.icon,
    d.total_beds,
    d.is_emergency,
    d.is_active,
    ds.occupied_beds,
    ds.capacity_pct,
    ds.wait_time_mins,
    ds.active_doctors,
    ds.patient_count,
    ds.recorded_at
FROM departments d
LEFT JOIN department_snapshots ds ON ds.department_id = d.id
WHERE d.is_active = TRUE
ORDER BY ds.department_id, ds.recorded_at DESC;

-- Risk distribution for charts
CREATE VIEW v_risk_distribution AS
SELECT
    risk_level,
    COUNT(*) AS count
FROM triage_results
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY risk_level;

-- Department patient load for charts
CREATE VIEW v_department_load AS
SELECT
    d.name AS department_name,
    COUNT(tr.id) AS patient_count
FROM departments d
LEFT JOIN triage_results tr ON tr.department_id = d.id
    AND DATE(tr.created_at) = CURRENT_DATE
    AND tr.attended_at IS NULL
WHERE d.is_active = TRUE
GROUP BY d.id, d.name
ORDER BY patient_count DESC;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_code ON patients(patient_code);
CREATE INDEX idx_triage_patient ON triage_results(patient_id);
CREATE INDEX idx_triage_created ON triage_results(created_at DESC);
CREATE INDEX idx_triage_risk ON triage_results(risk_level);
CREATE INDEX idx_triage_dept ON triage_results(department_id);
CREATE INDEX idx_intake_patient ON patient_intakes(patient_id);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved, created_at DESC) WHERE is_resolved = FALSE;
CREATE INDEX idx_hourly_date ON hourly_stats(stat_date, stat_hour);
CREATE INDEX idx_daily_date ON daily_stats(stat_date DESC);
CREATE INDEX idx_dept_perf ON department_performance(department_id, stat_date DESC);
