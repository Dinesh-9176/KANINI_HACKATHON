"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PatientDetails } from "@/components/triage/PatientDetails"
import { DepartmentRecommendations } from "@/components/triage/DepartmentRecommendations"
import { mockPatients } from "@/lib/mockData"
import type { Patient } from "@/lib/mockData"

function TriageContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const source = searchParams.get("source")

    // Read triage result from sessionStorage in useEffect (not during SSR)
    const [triagePatient, setTriagePatient] = React.useState<Patient | undefined>(undefined)

    React.useEffect(() => {
        if (source === "intake") {
            try {
                const stored = sessionStorage.getItem("triageResult")
                if (stored) {
                    const result = JSON.parse(stored)
                    setTriagePatient({
                        id: result.patient_id,
                        name: result.name,
                        age: result.age,
                        gender: result.gender,
                        riskLevel: result.risk_level as "high" | "medium" | "low",
                        priorityScore: result.priority_score,
                        waitingTime: result.waiting_time,
                        department: result.department,
                        confidence: result.confidence,
                        predictedDisease: result.predicted_disease,
                        contributingFactors: result.contributing_factors,
                        vitals: result.vitals,
                    })
                }
            } catch (e) {
                console.error("Failed to parse triage result:", e)
            }
        }
    }, [source])

    // Default to triage result from API, or fall back to mock patients
    const selectedPatient = React.useMemo(() => {
        if (triagePatient) return triagePatient
        if (id) {
            return mockPatients.find((p) => p.id === id) || mockPatients[0]
        }
        return mockPatients[0]
    }, [id, triagePatient])

    // Get the department ID for recommendations
    const recommendedDeptId = React.useMemo(() => {
        if (!selectedPatient) return undefined
        const deptMap: Record<string, string> = {
            "Cardiology": "cardiology",
            "Emergency": "emergency",
            "General": "general",
            "General Medicine": "general",
            "Neurology": "neurology",
            "Orthopedics": "orthopedics",
            "Pediatrics": "pediatrics",
            "Respiratory": "pulmonology",
            "Pulmonology": "pulmonology",
            "Dermatology": "dermatology",
            "Gastroenterology": "gastroenterology",
            "ENT": "ent",
            "Ophthalmology": "ophthalmology",
            "Nephrology": "nephrology",
            "Oncology": "oncology",
            "Endocrinology": "endocrinology",
            "Psychiatry": "psychiatry",
            "Urology": "urology",
            "Gynecology": "gynecology",
            "Hematology": "hematology",
            "Infectious Disease": "infectious-disease",
            "Rheumatology": "rheumatology",
        }
        return deptMap[selectedPatient.department] || "general"
    }, [selectedPatient])

    return (
        <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Left Panel: Patient Details (65% width) */}
            <div className="flex-[2] bg-secondary/10 min-w-[500px] border-r">
                <PatientDetails patient={selectedPatient} />
            </div>

            {/* Right Panel: Department Recommendations (35% width) */}
            <div className="flex-1 min-w-[320px] max-w-[450px]">
                <DepartmentRecommendations recommendedDept={recommendedDeptId} />
            </div>
        </div>
    )
}

export default function TriagePage() {
    return (
        <React.Suspense fallback={
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center rounded-xl border bg-background shadow-sm">
                <div className="text-muted-foreground">Loading triage data...</div>
            </div>
        }>
            <TriageContent />
        </React.Suspense>
    )
}
