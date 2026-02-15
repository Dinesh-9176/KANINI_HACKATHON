"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PatientDetails } from "@/components/triage/PatientDetails"
import { DepartmentRecommendations } from "@/components/triage/DepartmentRecommendations"
import { mockPatients, type Patient } from "@/lib/mockData"

export default function TriagePage() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const [selectedPatient, setSelectedPatient] = React.useState<Patient | undefined>(undefined)

    React.useEffect(() => {
        const loadPatient = () => {
            if (id === 'latest') {
                try {
                    const saved = localStorage.getItem('latestPatient')
                    if (saved) {
                        setSelectedPatient(JSON.parse(saved))
                        return
                    }
                } catch (e) {
                    console.error("Failed to load patient from storage", e)
                }
            }

            if (id) {
                const found = mockPatients.find((p) => p.id === id)
                if (found) {
                    setSelectedPatient(found)
                    return
                }
            }

            // Fallback
            setSelectedPatient(mockPatients[0])
        }

        loadPatient()
    }, [id])

    // Get the department ID for recommendations
    const recommendedDeptId = React.useMemo(() => {
        if (!selectedPatient) return undefined
        const deptMap: Record<string, string> = {
            "Cardiology": "cardiology",
            "Emergency": "emergency",
            "Emergency / ICU": "emergency",
            "General Medicine": "general",
            "Neurology": "neurology",
            "Orthopedics": "orthopedics",
            "Pediatrics": "pediatrics_geriatrics",
            "Pediatrics / Geriatrics": "pediatrics_geriatrics",
            "Pulmonology": "pulmonology",
            "Respiratory": "pulmonology",
            "Gastroenterology": "gastroenterology",
            "Dermatology": "dermatology",
            "Nephrology": "nephrology",
            "Psychiatry": "psychiatry",
            "ENT": "ent",
            "Urology": "urology",
            "Endocrinology": "endocrinology",
            "Infectious Disease": "infectious",
            "Trauma": "trauma",
            "OB-GYN": "obgyn",
            "Gynecology": "obgyn",
            "Hematology": "general",
            "Oncology": "general",
            "Rheumatology": "general",
            "Ophthalmology": "general",
            "Physiotherapy": "physiotherapy",
        }
        return deptMap[selectedPatient.department] || "general"
    }, [selectedPatient])

    return (
        <div className="relative h-screen bg-background bg-grid-pattern p-6 flex flex-col overflow-hidden">
            {/* Floating Glass Header */}
            <header className="flex-shrink-0 z-30 backdrop-blur-xl bg-background/70 border border-white/10 shadow-2xl rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left Panel: Patient Details */}
                <div className="lg:col-span-8 bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <PatientDetails patient={selectedPatient} />
                </div>

                {/* Right Panel: Recommendations */}
                <div className="lg:col-span-4 bg-card/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-y-auto shadow-2xl">
                    <DepartmentRecommendations recommendedDept={recommendedDeptId} />
                </div>
            </div>
        </div>
    )
}
