"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type Patient } from "@/lib/mockData"
import { cn } from "@/lib/utils"
import { ECGMonitor } from "./ECGMonitor"

interface ContributingFactor {
    name: string
    value: string
    impact: number // 0-100 percentage
    isPositive: boolean // green if true, red/orange if false
}

interface PatientDetailsProps {
    patient: Patient | undefined
}

// Mock contributing factors based on patient risk level
const getContributingFactors = (patient: Patient): ContributingFactor[] => {
    if (patient.riskLevel === "high") {
        return [
            { name: "Heart Rate", value: "130 bpm", impact: 92, isPositive: false },
            { name: "Blood Pressure", value: "160/95 mmHg", impact: 85, isPositive: false },
            { name: "Chest Pain", value: "Severe", impact: 78, isPositive: false },
            { name: "Oxygen Saturation", value: "94%", impact: 65, isPositive: false },
            { name: "Age Factor", value: "45 years", impact: 42, isPositive: true },
        ]
    } else if (patient.riskLevel === "medium") {
        return [
            { name: "Heart Rate", value: "95 bpm", impact: 55, isPositive: false },
            { name: "Temperature", value: "99.5°F", impact: 48, isPositive: false },
            { name: "Respiratory Rate", value: "20/min", impact: 35, isPositive: false },
            { name: "Blood Pressure", value: "125/82 mmHg", impact: 25, isPositive: true },
            { name: "SpO2", value: "97%", impact: 15, isPositive: true },
        ]
    } else {
        return [
            { name: "Blood Pressure", value: "118/75 mmHg", impact: 15, isPositive: true },
            { name: "Heart Rate", value: "72 bpm", impact: 12, isPositive: true },
            { name: "Temperature", value: "98.4°F", impact: 8, isPositive: true },
            { name: "Oxygen Saturation", value: "99%", impact: 5, isPositive: true },
        ]
    }
}

// ... props ...

// Risk badge styles corrected - no icon
function getRiskBadgeStyles(riskLevel: string) {
    switch (riskLevel) {
        case "high":
            return {
                bg: "bg-red-100 dark:bg-red-900/30",
                text: "text-red-700 dark:text-red-400",
                border: "border-red-200 dark:border-red-800",
                label: "High Risk"
            }
        case "medium":
            return {
                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                text: "text-yellow-700 dark:text-yellow-400",
                border: "border-yellow-200 dark:border-yellow-800",
                label: "Medium Risk"
            }
        default:
            return {
                bg: "bg-green-100 dark:bg-green-900/30",
                text: "text-green-700 dark:text-green-400",
                border: "border-green-200 dark:border-green-800",
                label: "Low Risk"
            }
    }
}

export function PatientDetails({ patient }: PatientDetailsProps) {
    // ... state & effect (unchanged) ...
    const [vitals, setVitals] = React.useState({
        hr: patient?.vitals?.hr || 98,
        bpSys: patient?.vitals ? parseInt(patient.vitals.bp.split('/')[0]) : 142,
        bpDia: patient?.vitals ? parseInt(patient.vitals.bp.split('/')[1]) : 90,
        spo2: patient?.vitals?.spo2 || 96,
        temp: patient?.vitals?.temp || 99.1
    })

    // Simulate Live Data
    React.useEffect(() => {
        if (!patient) return

        const interval = setInterval(() => {
            setVitals(prev => ({
                hr: prev.hr + (Math.random() > 0.5 ? 1 : -1),
                bpSys: prev.bpSys + (Math.random() > 0.5 ? 2 : -2),
                bpDia: prev.bpDia + (Math.random() > 0.5 ? 1 : -1),
                spo2: Math.min(100, Math.max(90, prev.spo2 + (Math.random() > 0.5 ? 1 : -1))),
                temp: Number((prev.temp + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1))
            }))
        }, 2000)
        return () => clearInterval(interval)
    }, [patient])

    if (!patient) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a patient to view details
            </div>
        )
    }

    const riskStyles = getRiskBadgeStyles(patient.riskLevel)
    const factors = getContributingFactors(patient)

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar">
            {/* Header Section */}
            <div className="clay-card p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="space-y-2 w-full md:w-auto">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{patient.name}</h1>
                        <Badge variant="outline" className={cn("text-xs font-bold tracking-widest uppercase px-3 py-1 border-0 rounded-full", riskStyles.bg, riskStyles.text)}>
                            {riskStyles.label}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">#{patient.id}</span>
                        <span className="hidden md:inline">•</span>
                        <span>{patient.age} Years</span>
                        <span className="hidden md:inline">•</span>
                        <span>{patient.gender}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400 font-semibold">
                            {patient.waitingTime}m waiting
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">AI Confidence</div>
                        <div className="text-4xl font-black text-cyan-900 dark:text-white flex items-center justify-end gap-1">
                            {patient.confidence}%
                        </div>
                    </div>

                    <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block" />

                    <div className="flex-1 md:flex-none">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-slate-500">Priority</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-white">{patient.priorityScore}</span>
                        </div>
                        <div className="h-3 w-32 clay-inset overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-1000",
                                    patient.priorityScore >= 70 ? "bg-red-500" :
                                        patient.priorityScore >= 40 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${patient.priorityScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vital Monitors */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        Vital Monitors
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full clay-inset bg-emerald-50 dark:bg-emerald-900/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">LIVE</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Heart Rate - With ECG Visual */}
                    {/* Heart Rate - With ECG Visual - Split Layout */}
                    <div className="clay-card flex flex-col justify-between p-5 h-40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        {/* Top Section: Data */}
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</span>
                                <div className="p-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{vitals.hr}</span>
                                <span className="text-sm text-slate-500 font-bold">bpm</span>
                            </div>
                        </div>

                        {/* Bottom Section: Monitor */}
                        <div className="absolute inset-x-0 bottom-0 h-20 w-full opacity-100 pointer-events-none">
                            <ECGMonitor className="w-full h-full" color="#f43f5e" bpm={vitals.hr} />
                        </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="clay-card p-5 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
                            <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                                {/* Icon */}
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{vitals.bpSys}/{vitals.bpDia}</span>
                            <span className="text-xs text-slate-500 font-medium">mmHg</span>
                        </div>
                    </div>

                    {/* SpO2 */}
                    <div className="clay-card p-5 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SpO2</span>
                            <div className="p-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600">
                                {/* Icon */}
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 tracking-tight">{vitals.spo2}</span>
                            <span className="text-xs text-slate-500 font-medium">%</span>
                        </div>
                    </div>

                    {/* Temp */}
                    <div className="clay-card p-5 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temp</span>
                            <div className="p-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                                {/* Icon */}
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{vitals.temp}</span>
                            <span className="text-xs text-slate-500 font-medium">°F</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="clay-card p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Reported Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                        {patient.symptoms?.map((symptom, i) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-0 transition-all hover:scale-105 cursor-default shadow-sm">
                                {symptom}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="clay-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">AI Diagnosis</h3>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xl tracking-tight">{patient.department}</div>
                            <div className="text-xs text-slate-500 mt-1">Based on {patient.symptoms?.length} key markers</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">~{patient.waitingTime + 5}m</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Wait</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Analysis - Dark Table */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] pl-1">Risk Factors Analysis</h3>
                <div className="clay-card overflow-hidden">
                    {factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{factor.name}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500 font-mono">{factor.value}</span>
                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full shadow-sm", factor.isPositive ? "bg-emerald-500" : "bg-red-500")}
                                        style={{ width: `${factor.impact}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions Footer - Floating */}
            <div className="flex gap-4 pt-4 mt-auto">
                <Button className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/20 border-0 h-12 rounded-xl font-bold tracking-wide clay-button" size="lg">MARK ATTENDED</Button>
                <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-12 rounded-xl clay-button bg-white dark:bg-slate-800 hover:bg-slate-50" size="lg">TRANSFER</Button>
            </div>
        </div>
    )
}
