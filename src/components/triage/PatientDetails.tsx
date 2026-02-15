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
    ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type Patient } from "@/components/custom/PatientCard"

interface PatientDetailsProps {
    patient: Patient | undefined
}

export function PatientDetails({ patient }: PatientDetailsProps) {
    if (!patient) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a patient to view details
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* 1️⃣ Patient Info Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        ID: #{patient.id} • {patient.age} Years • {patient.gender} • Arrived: 10:42 AM
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            {patient.department}
                        </Badge>
                        <Badge variant={patient.riskLevel} className="text-sm px-3 py-1">
                            {patient.riskLevel.toUpperCase()} RISK
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{patient.priorityScore}</div>
                    <div className="text-sm text-muted-foreground">Priority Score</div>
                </div>
            </div>

            {/* 2️⃣ Vitals Card */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, color: "text-blue-500" },
                    { label: "Heart Rate", value: "88", unit: "bpm", icon: Heart, color: "text-red-500" },
                    { label: "Temperature", value: "98.6", unit: "°F", icon: Thermometer, color: "text-orange-500" },
                    { label: "SpO2", value: "98", unit: "%", icon: Wind, color: "text-cyan-500" },
                ].map((vital, i) => (
                    <Card key={i} className="border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <vital.icon className={`h-6 w-6 mb-2 ${vital.color}`} />
                            <div className="text-2xl font-bold">{vital.value}</div>
                            <div className="text-xs text-muted-foreground">{vital.label} ({vital.unit})</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 3️⃣ AI Risk Analysis */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        AI Predictive Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="font-semibold">Sepsis Probability</p>
                            <p className="text-sm text-muted-foreground">Based on current vitals and history</p>
                        </div>
                        <div className="text-2xl font-bold text-primary">{patient.confidence}%</div>
                    </div>
                    <Progress value={patient.confidence} className="h-3" />

                    <div className="space-y-2 pt-2">
                        <p className="text-sm font-semibold">Contributing Factors:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 text-orange-500" /> Elevated Heart Rate
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 text-orange-500" /> Fever Spike
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-500" /> Normal BP
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* 4️⃣ Action Section */}
            <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" size="lg">mark as Attended</Button>
                <Button variant="destructive" className="flex-1" size="lg">Escalate Priority</Button>
                <Button variant="outline" className="flex-1" size="lg">
                    Transfer Dept
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
