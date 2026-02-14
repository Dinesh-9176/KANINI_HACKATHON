"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PatientDetails } from "@/components/triage/PatientDetails"
import { DepartmentRecommendations } from "@/components/triage/DepartmentRecommendations"
import { mockPatients } from "@/lib/mockData"

export default function TriagePage() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")

    // Default to first patient if no ID
    const selectedPatient = React.useMemo(
        () => {
            if (id) {
                return mockPatients.find((p) => p.id === id) || mockPatients[0]
            }
            return mockPatients[0]
        },
        [id]
    )

    // Get the department ID for recommendations
    const recommendedDeptId = React.useMemo(() => {
        if (!selectedPatient) return undefined
        const deptMap: Record<string, string> = {
            "Cardiology": "cardiology",
            "Emergency": "emergency",
            "General": "general",
            "Neurology": "neurology",
            "Orthopedics": "orthopedics",
            "Pediatrics": "pediatrics",
            "Respiratory": "pulmonology"
        }
        return deptMap[selectedPatient.department]
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
