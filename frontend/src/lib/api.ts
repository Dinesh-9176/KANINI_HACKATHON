const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, options)
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `API error: ${res.status}`)
    }
    return res.json()
}

// --- Dashboard (generic) ---
export interface DashboardKPIs {
    total_patients_today: number
    high_risk_count: number
    avg_waiting_time: number
    active_alerts: number
}

export interface DashboardData {
    kpis: DashboardKPIs
    risk_distribution: Array<{ risk_level: string; count: number }>
    department_load: Array<{ department_name: string; patient_count: number }>
}

export function fetchDashboard(): Promise<DashboardData> {
    return fetchAPI("/api/dashboard")
}

// --- Dashboard (specific endpoints from upstream) ---
export interface KPIData {
    total_patients: number
    high_risk: number
    avg_wait: number
    department_load: number
}

export interface RiskDistribution {
    name: string
    value: number
    color: string
}

export interface DepartmentLoad {
    name: string
    patients: number
}

export interface Alert {
    id: string
    message: string
    type: "critical" | "warning" | "info"
    time: string
}

export async function fetchDashboardStats(): Promise<KPIData> {
    try {
        return await fetchAPI<KPIData>("/api/dashboard/stats")
    } catch (error) {
        console.error("API Error:", error)
        return { total_patients: 0, high_risk: 0, avg_wait: 0, department_load: 0 }
    }
}

export async function fetchRiskDistribution(): Promise<RiskDistribution[]> {
    try {
        return await fetchAPI<RiskDistribution[]>("/api/dashboard/risks")
    } catch (error) {
        console.error("API Error:", error)
        return []
    }
}

export async function fetchDepartmentLoad(): Promise<DepartmentLoad[]> {
    try {
        return await fetchAPI<DepartmentLoad[]>("/api/dashboard/departments")
    } catch (error) {
        console.error("API Error:", error)
        return []
    }
}

export async function fetchAlerts(): Promise<Alert[]> {
    try {
        return await fetchAPI<Alert[]>("/api/dashboard/alerts")
    } catch (error) {
        console.error("API Error:", error)
        return []
    }
}

// --- Patients ---
export interface QueuePatient {
    id: string
    patient_code: string
    name: string
    age: number
    gender: string
    status: string
    risk_level: string
    priority_score: number
    confidence: number
    predicted_disease: string
    waiting_time: number
    estimated_los_days: number
    los_confidence: number
    department_id: string
    department_name: string
    triage_time: string
}

export function fetchPatients(): Promise<QueuePatient[]> {
    return fetchAPI("/api/patients")
}

// --- Single Patient Detail ---
export interface PatientDetail {
    patient: {
        id: string
        patient_code: string
        name: string
        age: number
        gender: string
        status: string
        created_at: string
    }
    intake: {
        blood_pressure_systolic: number | null
        blood_pressure_diastolic: number | null
        heart_rate: number | null
        temperature: number | null
        oxygen_saturation: number | null
        respiratory_rate: number | null
        symptoms: string[]
        conditions: string[]
        notes: string
    } | null
    triage: {
        risk_level: string
        priority_score: number
        confidence: number
        predicted_disease: string
        department_id: string
        waiting_time: number
        triage_level: number
        estimated_los_days: number
        los_confidence: number
    } | null
    contributing_factors: Array<{
        name: string
        value: string
        impact: number
        is_positive: boolean
    }>
    department_name: string
}

export function fetchPatient(patientCode: string): Promise<PatientDetail> {
    return fetchAPI(`/api/patients/${patientCode}`)
}

export function updatePatientStatus(patientCode: string, status: string) {
    return fetchAPI(`/api/patients/${patientCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    })
}

// --- Departments ---
export interface Department {
    id: string
    name: string
    description: string
    total_beds: number
    is_emergency: boolean
    is_active: boolean
    // From snapshot (may not exist)
    occupied_beds?: number
    capacity_pct?: number
    wait_time_mins?: number
    active_doctors?: number
    patient_count?: number
}

export function fetchDepartments(): Promise<Department[]> {
    return fetchAPI("/api/departments")
}

// --- Triage submission ---
export interface TriagePayload {
    name: string
    age: number
    gender: string
    blood_pressure_systolic: number | null
    blood_pressure_diastolic: number | null
    heart_rate: number | null
    temperature: number | null
    oxygen_saturation: number | null
    respiratory_rate: number | null
    symptoms: string[]
    conditions: string[]
    notes: string
}

export function submitTriage(payload: TriagePayload) {
    return fetchAPI("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
}

export function parseEHR(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    return fetchAPI("/api/parse-ehr", {
        method: "POST",
        body: fd,
    })
}

// --- Feature 4: Resources (Beds & Labs) ---

export interface Bed {
    id: string
    department_id: string
    bed_number: string
    is_occupied: boolean
    current_patient_id?: string
}

export function fetchBeds(departmentId?: string): Promise<Bed[]> {
    const query = departmentId ? `?department_id=${departmentId}` : ""
    return fetchAPI(`/api/beds${query}`)
}

export function assignBed(bedId: string, patientId: string) {
    return fetchAPI("/api/beds/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bed_id: bedId, patient_id: patientId }),
    })
}

export interface Lab {
    id: string
    name: string
    type: string
    is_available: boolean
    next_available_slot?: string
}

export function fetchLabs(): Promise<Lab[]> {
    return fetchAPI("/api/labs")
}

export function bookLab(labId: string, patientId: string) {
    return fetchAPI("/api/labs/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lab_id: labId, patient_id: patientId }),
    })
}
