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
        <div className="relative min-h-screen bg-background bg-grid-pattern p-6 overflow-y-auto">
            {/* Floating Glass Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border border-white/10 shadow-2xl rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-background">
                            {selectedPatient?.name.split(' ').map(n => n[0]).join('')}
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
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-6 border-r border-border/50 pr-8">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Admitted</span>
                        <span className="font-mono text-lg font-bold text-foreground">10:45 AM</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
                {/* Left Panel: Patient Details */}
                <div className="lg:col-span-8 bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <PatientDetails patient={selectedPatient} />
                </div>

                {/* Right Panel: Recommendations */}
                <div className="lg:col-span-4 bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <DepartmentRecommendations recommendedDept={recommendedDeptId} />
                </div>
            </div>
        </div>
    )
}
