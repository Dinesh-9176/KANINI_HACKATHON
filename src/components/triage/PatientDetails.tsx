"use client"

import * as React from "react"
import {
    Activity,
    Thermometer,
    Heart,
    Wind,
    BrainCircuit,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Clock,
    AlertCircle,
    TrendingUp,
    FileText,
    Zap,
    Waves
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type Patient } from "@/lib/mockData"
import { cn } from "@/lib/utils"

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

function getRiskBadgeStyles(riskLevel: string) {
    switch (riskLevel) {
        case "high":
            return {
                bg: "bg-red-100 dark:bg-red-900/30",
                text: "text-red-700 dark:text-red-400",
                border: "border-red-200 dark:border-red-800",
                icon: AlertTriangle,
                label: "High Risk"
            }
        case "medium":
            return {
                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                text: "text-yellow-700 dark:text-yellow-400",
                border: "border-yellow-200 dark:border-yellow-800",
                icon: AlertCircle,
                label: "Medium Risk"
            }
        default:
            return {
                bg: "bg-green-100 dark:bg-green-900/30",
                text: "text-green-700 dark:text-green-400",
                border: "border-green-200 dark:border-green-800",
                icon: CheckCircle2,
                label: "Low Risk"
            }
    }
}

export function PatientDetails({ patient }: PatientDetailsProps) {
    if (!patient) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a patient to view details
            </div>
        )
    }

    const riskStyles = getRiskBadgeStyles(patient.riskLevel)
    const factors = getContributingFactors(patient)
    const RiskIcon = riskStyles.icon

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{patient.name}</h1>
                            <Badge variant="outline" className={cn("text-sm font-medium px-2.5 py-0.5", riskStyles.bg, riskStyles.text, riskStyles.border)}>
                                <RiskIcon className="w-3.5 h-3.5 mr-1.5" />
                                {riskStyles.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>ID: #{patient.id}</span>
                            <span>•</span>
                            <span>{patient.age} Years</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {patient.waitingTime}m waiting
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground">AI Confidence</div>
                        <div className="text-2xl font-bold text-primary flex items-center justify-end gap-1">
                            <Zap className="w-4 h-4" />
                            {patient.confidence}%
                        </div>
                    </div>
                </div>

                {/* Priority Score - Simple Linear Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">Priority Score</span>
                        <span className="font-bold">{patient.priorityScore}/100</span>
                    </div>
                    <Progress
                        value={patient.priorityScore}
                        className="h-2"
                        indicatorClassName={cn(
                            patient.priorityScore >= 70 ? "bg-red-500" :
                                patient.priorityScore >= 40 ? "bg-yellow-500" : "bg-green-500"
                        )}
                    />
                </div>
            </div>

            {/* Vitals Section - Simple Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    Vitals
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity },
                        { label: "Heart Rate", value: "88", unit: "bpm", icon: Heart },
                        { label: "Temperature", value: "98.6", unit: "°F", icon: Thermometer },
                        { label: "SpO2", value: "98", unit: "%", icon: Wind },
                    ].map((vital, i) => (
                        <div key={i} className="flex flex-col p-4 rounded-lg bg-secondary/20 border border-border/50">
                            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                <vital.icon className="w-4 h-4" />
                                {vital.label}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{vital.value}</span>
                                <span className="text-xs text-muted-foreground font-medium">{vital.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Department - Clean Layout */}
            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Recommended: {patient.department}
                    </h3>
                    <Badge variant="secondary" className="font-normal">
                        ~{patient.waitingTime + 5}m wait
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Based on symptoms: Chest Pain, Shortness of Breath, Elevated BP
                </p>
            </div>


            {/* AI Analysis - Clean List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-muted-foreground" />
                    Analysis Factors
                </h3>
                <div className="space-y-3">
                    {factors.map((factor, index) => (
                        <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">{factor.name}</span>
                                <span className="text-muted-foreground">{factor.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full", factor.isPositive ? "bg-green-500" : "bg-red-500")}
                                    style={{ width: `${factor.impact}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 pt-6 mt-auto">
                <Button className="flex-1" size="lg">Mark Attended</Button>
                <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10" size="lg">Escalate</Button>
                <Button variant="secondary" className="flex-1" size="lg"> Transfer </Button>
            </div>
        </div>
    )
}
