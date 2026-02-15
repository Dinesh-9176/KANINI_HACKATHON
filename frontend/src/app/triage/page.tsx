"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PatientDetails } from "@/components/triage/PatientDetails"
import { DepartmentRecommendations } from "@/components/triage/DepartmentRecommendations"
import { ResourceStatus } from "@/components/triage/ResourceStatus"
import { mockPatients } from "@/lib/mockData"
import type { Patient } from "@/lib/mockData"

// Shape of API triage response stored in localStorage
interface TriageResult {
    patient_id: string
    name: string
    age: number
    gender: string
    risk_level: "high" | "medium" | "low"
    priority_score: number
    department: string
    confidence: number
    predicted_disease: string
    top_diseases: Array<{
        disease: string
        probability: number
    }>
    contributing_factors: Array<{
        name: string
        value: string
        impact: number
        isPositive: boolean
    }>
    waiting_time: number
    vitals: {
        bloodPressure: string
        heartRate: string
        temperature: string
        oxygenSaturation: string
        respiratoryRate: string
    }
    symptoms: string[]
    estimated_los_days: number
    los_confidence: number
}

function triageResultToPatient(result: TriageResult): Patient {
    const bp = result.vitals.bloodPressure || "120/80"
    return {
        id: result.patient_id,
        name: result.name,
        age: result.age,
        gender: result.gender,
        riskLevel: result.risk_level,
        priorityScore: result.priority_score,
        waitingTime: result.waiting_time,
        department: result.department,
        confidence: result.confidence,
        symptoms: result.symptoms || [],
        vitals: {
            hr: parseInt(result.vitals.heartRate) || 75,
            bp: bp,
            spo2: parseInt(result.vitals.oxygenSaturation) || 98,
            temp: parseFloat(result.vitals.temperature) || 98.6,
        },
        estimatedLosDays: result.estimated_los_days,
        losConfidence: result.los_confidence,
    }
}

// Department name -> ID mapping for recommendations panel
const DEPT_MAP: Record<string, string> = {
    "Cardiology": "cardiology",
    "Emergency": "emergency",
    "Emergency Medicine": "emergency",
    "General": "general",
    "General Medicine": "general",
    "Neurology": "neurology",
    "Orthopedics": "orthopedics",
    "Pediatrics": "pediatrics_geriatrics",
    "Respiratory": "pulmonology",
    "Pulmonology": "pulmonology",
    "Gastroenterology": "gastroenterology",
    "Dermatology": "dermatology",
    "Endocrinology": "endocrinology",
    "ENT": "ent",
    "Nephrology": "nephrology",
    "Urology": "urology",
    "Psychiatry": "psychiatry",
    "Infectious Disease": "infectious",
    "Oncology": "general",
    "Hematology": "general",
    "Rheumatology": "orthopedics",
    "Gynecology": "obgyn",
    "OB-GYN": "obgyn",
    "Ophthalmology": "general",
    "Trauma": "trauma",
}

import { fetchPatient, type PatientDetail } from "@/lib/api"

// Internal component for search params logic
function TriageContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const source = searchParams.get("source")

    const [apiPatient, setApiPatient] = React.useState<Patient | undefined>(undefined)
    const [loading, setLoading] = React.useState(false)
    const [time, setTime] = React.useState<string>("--:--")

    React.useEffect(() => {
        setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
        }, 60000)
        return () => clearInterval(timer)
    }, [])

    // Effect to fetch patient if ID is present and not from intake source
    React.useEffect(() => {
        if (id && source !== "intake") {
            setLoading(true)
            fetchPatient(id)
                .then((data) => {
                    const p = data.patient
                    const t = data.triage
                    const i = data.intake

                    const mappedPatient: Patient = {
                        id: p.patient_code,
                        name: p.name,
                        age: p.age,
                        gender: p.gender,
                        riskLevel: (t?.risk_level || "low") as "high" | "medium" | "low",
                        priorityScore: t?.priority_score || 0,
                        waitingTime: t?.waiting_time || 0,
                        department: data.department_name,
                        departmentId: t?.department_id,
                        departmentName: data.department_name,
                        confidence: t?.confidence || 0,
                        symptoms: i?.symptoms || [],
                        vitals: {
                            hr: i?.heart_rate || 75,
                            bp: `${i?.blood_pressure_systolic || 120}/${i?.blood_pressure_diastolic || 80}`,
                            spo2: i?.oxygen_saturation || 98,
                            temp: i?.temperature || 98.6,
                        },
                        estimatedLosDays: t?.estimated_los_days,
                        losConfidence: t?.los_confidence,
                    }
                    setApiPatient(mappedPatient)
                })
                .catch(err => console.error("Failed to fetch patient", err))
                .finally(() => setLoading(false))
        }
    }, [id, source])


    // State for local storage data
    const [localData, setLocalData] = React.useState<{
        selectedPatient?: Patient,
        contributingFactors?: any[],
        predictedDisease?: string,
        topDiseases?: any[]
    }>({})

    React.useEffect(() => {
        if (source === "intake") {
            try {
                const stored = localStorage.getItem("triageResult")
                if (stored) {
                    const result: TriageResult = JSON.parse(stored)
                    setLocalData({
                        selectedPatient: triageResultToPatient(result),
                        contributingFactors: result.contributing_factors,
                        predictedDisease: result.predicted_disease,
                        topDiseases: result.top_diseases,
                    })
                }
            } catch (e) {
                console.error("Failed to parse triage result from localStorage:", e)
            }
        }
    }, [source])

    const { selectedPatient, contributingFactors, predictedDisease, topDiseases } = React.useMemo(() => {
        if (source === "intake") {
            return localData
        }

        // Use API fetched patient if available
        if (apiPatient) {
            return {
                selectedPatient: apiPatient,
                contributingFactors: undefined,
                predictedDisease: apiPatient.department,
                topDiseases: undefined
            }
        }

        return {}
    }, [source, apiPatient, localData])

    // Get the department ID for recommendations
    const recommendedDeptId = React.useMemo(() => {
        if (!selectedPatient) return undefined
        return DEPT_MAP[selectedPatient.department] || "general"
    }, [selectedPatient])

    return (
        <div className="relative min-h-screen bg-background bg-grid-pattern p-6 flex flex-col">
            {/* Floating Glass Header */}
            <header className="sticky top-0 z-50 flex-shrink-0 backdrop-blur-xl bg-background/70 border border-white/10 shadow-2xl rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-background">
                            {selectedPatient?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                                {selectedPatient?.name}
                            </h1>
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
                                {selectedPatient?.id}
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-1 text-sm font-medium text-muted-foreground/80">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {selectedPatient?.gender}</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {selectedPatient?.age} yrs</span>
                            {predictedDisease && (
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> {predictedDisease}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-6 border-r border-border/50 pr-8">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Admitted</span>
                        <span className="font-mono text-lg font-bold text-foreground">
                            {time}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left Panel: Patient Details */}
                <div className="lg:col-span-8 bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <PatientDetails patient={selectedPatient} contributingFactors={contributingFactors} predictedDisease={predictedDisease} topDiseases={topDiseases} />
                </div>

                {/* Right Panel: Recommendations */}
                <div className="lg:col-span-4 space-y-6 overflow-y-auto">
                    <ResourceStatus />
                    <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <DepartmentRecommendations recommendedDept={recommendedDeptId} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TriagePage() {
    return (
        <React.Suspense fallback={<div className="p-6">Loading triage...</div>}>
            <TriageContent />
        </React.Suspense>
    )
}
