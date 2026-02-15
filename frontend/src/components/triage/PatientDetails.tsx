"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { getContributingFactors, allocateResources } from "@/lib/triageUtils"
import { type Patient, type ContributingFactor } from "@/lib/mockData"
import { cn } from "@/lib/utils"
import { ECGMonitor } from "./ECGMonitor"
import { ReportIssueDialog } from "./ReportIssueDialog"
import { BedAllocation } from "./BedAllocation"
import { LabBooking } from "./LabBooking"

interface TopDisease {
    disease: string
    probability: number
}

interface PatientDetailsProps {
    patient: Patient | undefined
    contributingFactors?: ContributingFactor[]
    predictedDisease?: string
    topDiseases?: TopDisease[]
}

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

export function PatientDetails({ patient, contributingFactors: apiFactors, predictedDisease, topDiseases }: PatientDetailsProps) {
    // Vitals state
    const [vitals, setVitals] = React.useState({
        hr: patient?.vitals?.hr || 98,
        bpSys: patient?.vitals ? parseInt(patient.vitals.bp.split('/')[0]) : 142,
        bpDia: patient?.vitals ? parseInt(patient.vitals.bp.split('/')[1]) : 90,
        spo2: patient?.vitals?.spo2 || 96,
        temp: patient?.vitals?.temp || 99.1
    })

    // Button state
    const [isAttended, setIsAttended] = React.useState(false)
    const [showTransferDialog, setShowTransferDialog] = React.useState(false)
    const [isTransferring, setIsTransferring] = React.useState(false)
    const [transferComplete, setTransferComplete] = React.useState(false)
    const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'success' | 'info' } | null>(null)

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

    // Auto-dismiss status message
    React.useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [statusMessage])

    // Helper to persist patient status to localStorage
    const savePatientStatus = (updates: { attended?: boolean; transferred?: boolean; transferDept?: string }) => {
        if (!patient) return
        try {
            const saved = localStorage.getItem('patientStatuses')
            const statuses = saved ? JSON.parse(saved) : {}
            statuses[patient.id] = { ...(statuses[patient.id] || {}), ...updates }
            localStorage.setItem('patientStatuses', JSON.stringify(statuses))
        } catch (e) {
            console.error('Failed to save patient status', e)
        }
    }

    const handleMarkAttended = () => {
        setIsAttended(true)
        savePatientStatus({ attended: true })
        setStatusMessage({ text: `${patient?.name} marked as attended`, type: 'success' })
    }

    const handleTransferConfirm = () => {
        setIsTransferring(true)
        // Simulate transfer processing
        setTimeout(() => {
            setIsTransferring(false)
            setTransferComplete(true)
            setShowTransferDialog(false)
            savePatientStatus({ transferred: true, transferDept: patient?.department })
            setStatusMessage({ text: `Transfer to ${patient?.department} initiated successfully`, type: 'success' })
        }, 1500)
    }

    const handlePrint = () => {
        if (!patient) return

        const riskColor = patient.riskLevel === 'high' ? '#dc2626' : patient.riskLevel === 'medium' ? '#d97706' : '#16a34a'
        const currentFactors = patient.contributingFactors && patient.contributingFactors.length > 0
            ? patient.contributingFactors
            : getContributingFactors(patient)
        const now = new Date()
        const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        const printContent = `<!DOCTYPE html>
<html>
<head>
    <title>Patient Report - ${patient.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 3px solid #0e7490; padding-bottom: 20px; margin-bottom: 24px; }
        .header h1 { font-size: 28px; color: #0e7490; margin-bottom: 4px; }
        .header .subtitle { font-size: 12px; color: #64748b; letter-spacing: 0.05em; }
        .header .print-info { float: right; text-align: right; font-size: 11px; color: #94a3b8; }
        .patient-banner { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .patient-name { font-size: 22px; font-weight: 700; color: #0c4a6e; }
        .patient-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
        .patient-meta span { margin-right: 16px; }
        .risk-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: white; background: ${riskColor}; }
        .stats { display: flex; gap: 20px; }
        .stat-box { text-align: center; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; }
        .stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 700; }
        .stat-value { font-size: 24px; font-weight: 800; color: #0e7490; margin-top: 2px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .vital-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
        .vital-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 600; }
        .vital-value { font-size: 22px; font-weight: 700; color: #1e293b; margin-top: 4px; }
        .vital-unit { font-size: 11px; color: #94a3b8; font-weight: 500; }
        .symptoms { display: flex; flex-wrap: wrap; gap: 8px; }
        .symptom-tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px; font-size: 13px; color: #475569; }
        .diagnosis-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .diagnosis-dept { font-size: 18px; font-weight: 700; color: #0c4a6e; }
        .diagnosis-markers { font-size: 12px; color: #64748b; margin-top: 2px; }
        .diagnosis-wait { text-align: right; }
        .diagnosis-wait-value { font-size: 20px; font-weight: 700; color: #0e7490; }
        .diagnosis-wait-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
        .factors-table { width: 100%; border-collapse: collapse; }
        .factors-table th { text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .factors-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; }
        .factors-table tr:last-child td { border-bottom: none; }
        .bar-container { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; display: inline-block; vertical-align: middle; margin-left: 8px; }
        .bar-fill { height: 100%; border-radius: 3px; }
        .bar-positive { background: #16a34a; }
        .bar-negative { background: #dc2626; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        .status-row { display: flex; gap: 16px; margin-bottom: 24px; }
        .status-item { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .status-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 600; }
        .status-value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="print-info">Report Generated<br><strong>${printDate} at ${printTime}</strong></div>
        <h1>🏥 Patient Triage Report</h1>
        <div class="subtitle">Hospital System — AI-Assisted Triage Assessment</div>
    </div>

    <div class="patient-banner">
        <div>
            <div class="patient-name">${patient.name}</div>
            <div class="patient-meta">
                <span>🆔 #${patient.id}</span>
                <span>🎂 ${patient.age} Years</span>
                <span>⚧ ${patient.gender}</span>
                <span>⏱ ${patient.waitingTime}m waiting</span>
            </div>
        </div>
        <div class="risk-badge">${patient.riskLevel.toUpperCase()} RISK</div>
    </div>

    <div class="status-row">
        <div class="status-item">
            <div class="status-label">AI Confidence</div>
            <div class="status-value" style="color: #0e7490;">${patient.confidence}%</div>
        </div>
        <div class="status-item">
            <div class="status-label">Priority Score</div>
            <div class="status-value">${patient.priorityScore} / 100</div>
        </div>
        <div class="status-item">
            <div class="status-label">Triage Status</div>
            <div class="status-value" style="color: ${isAttended ? '#16a34a' : transferComplete ? '#2563eb' : '#d97706'};">${transferComplete ? 'Transferred' : isAttended ? 'Attended' : 'Pending'}</div>
        </div>
        <div class="status-item">
            <div class="status-label">Department</div>
            <div class="status-value">${patient.department}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Vital Signs</div>
        <div class="vitals-grid">
            <div class="vital-card">
                <div class="vital-label">Heart Rate</div>
                <div class="vital-value">${vitals.hr} <span class="vital-unit">bpm</span></div>
            </div>
            <div class="vital-card">
                <div class="vital-label">Blood Pressure</div>
                <div class="vital-value">${vitals.bpSys}/${vitals.bpDia} <span class="vital-unit">mmHg</span></div>
            </div>
            <div class="vital-card">
                <div class="vital-label">SpO2</div>
                <div class="vital-value">${vitals.spo2} <span class="vital-unit">%</span></div>
            </div>
            <div class="vital-card">
                <div class="vital-label">Temperature</div>
                <div class="vital-value">${vitals.temp} <span class="vital-unit">°F</span></div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Reported Symptoms</div>
        <div class="symptoms">
            ${(patient.symptoms || []).map(s => `<span class="symptom-tag">${s}</span>`).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">AI Diagnosis</div>
        <div class="diagnosis-box">
            <div>
                <div class="diagnosis-dept">${patient.department}</div>
                <div class="diagnosis-markers">Based on ${patient.symptoms?.length || 0} key markers${patient.predictedDisease ? ` · Predicted: ${patient.predictedDisease}` : ''}</div>
            </div>
            <div class="diagnosis-wait">
                <div class="diagnosis-wait-value">~${patient.waitingTime + 5}m</div>
                <div class="diagnosis-wait-label">Est. Wait</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Risk Factors Analysis</div>
        <table class="factors-table">
            <thead>
                <tr>
                    <th>Factor</th>
                    <th>Value</th>
                    <th>Impact</th>
                </tr>
            </thead>
            <tbody>
                ${currentFactors.map(f => `
                    <tr>
                        <td style="font-weight: 600;">${f.name}</td>
                        <td><code style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${f.value}</code></td>
                        <td>
                            ${f.impact}%
                            <div class="bar-container">
                                <div class="bar-fill ${f.isPositive ? 'bar-positive' : 'bar-negative'}" style="width: ${f.impact}%;"></div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This report was generated by the Hospital System AI Triage platform. All assessments are AI-assisted and should be reviewed by medical professionals.</p>
        <p style="margin-top: 4px;">© ${now.getFullYear()} Hospital System · Confidential Patient Record</p>
    </div>
</body>
</html>`

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()
            // Trigger print after content loads
            printWindow.onload = () => {
                printWindow.print()
            }
        }
    }

    if (!patient) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a patient to view details
            </div>
        )
    }

    const riskStyles = getRiskBadgeStyles(patient.riskLevel)
    // Use API factors first, then backend contributing factors, then fall back to mock
    const factors = apiFactors || (patient.contributingFactors && patient.contributingFactors.length > 0
        ? patient.contributingFactors
        : getContributingFactors(patient))

    // Ensure resources are allocated if not present
    if (!patient.allocatedRoom || !patient.requiredLabs) {
        const allocation = allocateResources(patient)
        patient.allocatedRoom = patient.allocatedRoom || allocation.room
        patient.requiredLabs = patient.requiredLabs || allocation.labs
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar relative">
            <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="sticky top-0 z-20 clay-card p-6 flex flex-col md:flex-row gap-6 items-start justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md mb-6 shadow-md">
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

                        <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block" />

                        <div className="flex items-center gap-2">
                            <ReportIssueDialog
                                patientId={patient.id}
                                patientName={patient.name}
                                currentPriority={patient.priorityScore}
                            />
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-all gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span className="hidden lg:inline font-semibold text-sm">Print Report</span>
                            </Button>
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

                {/* Resource Allocation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="clay-card p-6">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Room Assignment
                        </h3>
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <div>
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Allocated Unit</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">
                                    {patient.allocatedRoom || "Assigning..."}
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="clay-card p-6">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            Required Labs
                        </h3>
                        <div className="space-y-2">
                            {(patient.requiredLabs || []).length > 0 ? (
                                patient.requiredLabs?.map((lab, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{lab}</span>
                                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">Pending</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-400 italic">No specific labs ordered</div>
                            )}
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

                {/* Enhanced AI Diagnosis with Differential */}
                <div className="clay-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">AI Diagnosis</h3>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xl tracking-tight">{patient.department}</div>
                            {predictedDisease && (
                                <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 capitalize">{predictedDisease}</div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">Based on {patient.symptoms?.length} key markers</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">~{patient.waitingTime + 5}m</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Wait</div>
                        </div>
                    </div>
                    {topDiseases && topDiseases.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Differential Diagnosis</div>
                            {topDiseases.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300 capitalize">{d.disease}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", i === 0 ? "bg-cyan-500" : "bg-slate-400")}
                                                style={{ width: `${d.probability}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono w-10 text-right">{d.probability}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Length of Stay Prediction */}
                {patient.estimatedLosDays && (
                    <div className="clay-card p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-100 dark:border-indigo-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">Estimated Length of Stay</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
                                        {patient.estimatedLosDays}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-600/70 dark:text-indigo-400">Days</span>
                                </div>
                                <p className="text-xs text-indigo-400 mt-1 font-medium">
                                    Based on risk factors & vitals
                                </p>
                            </div>
                            {patient.losConfidence && (
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Confidence</div>
                                    <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300">
                                        {Math.round(patient.losConfidence * 100)}%
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bed Allocation & Lab Booking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="clay-card p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Bed Allocation - {patient.departmentName || "General"}</h3>
                        <BedAllocation departmentId={patient.departmentId || "general"} patientId={patient.id} />
                    </div>
                    <div className="clay-card p-6">
                        <LabBooking patientId={patient.id} />
                    </div>
                </div>

                {/* Status Toast */}
                {statusMessage && (
                    <div className={cn(
                        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-lg",
                        "animate-in slide-in-from-bottom-4 fade-in duration-300",
                        statusMessage.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                            : 'bg-blue-950/90 border-blue-500/30 text-blue-200'
                    )}>
                        <div className="flex items-center gap-3">
                            {statusMessage.type === 'success' && (
                                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                            <span className="text-sm font-semibold">{statusMessage.text}</span>
                        </div>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="flex gap-4 pt-4 mt-auto">
                    <Button
                        onClick={handleMarkAttended}
                        disabled={isAttended}
                        className={cn(
                            "flex-1 h-12 rounded-xl font-bold tracking-wide clay-button border-0 shadow-lg transition-all duration-500",
                            isAttended
                                ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-900/20 cursor-default"
                                : "bg-cyan-700 hover:bg-cyan-600 text-white shadow-cyan-900/20"
                        )}
                        size="lg"
                    >
                        {isAttended ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ATTENDED
                            </span>
                        ) : (
                            'MARK ATTENDED'
                        )}
                    </Button>

                    <Button
                        onClick={() => setShowTransferDialog(true)}
                        disabled={transferComplete}
                        variant="outline"
                        className={cn(
                            "flex-1 h-12 rounded-xl clay-button transition-all duration-500",
                            transferComplete
                                ? "bg-blue-600 hover:bg-blue-600 text-white border-blue-500 cursor-default"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50"
                        )}
                        size="lg"
                    >
                        {transferComplete ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                TRANSFERRED
                            </span>
                        ) : (
                            'TRANSFER'
                        )}
                    </Button>
                </div>

                {/* Transfer Confirmation Dialog */}
                <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                    <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl">Confirm Patient Transfer</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                You are about to transfer <span className="text-white font-semibold">{patient.name}</span> to the following department.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 p-4 rounded-xl bg-blue-950/50 border border-blue-500/20">
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Recommended Department</div>
                            <div className="text-xl font-bold text-white">{patient.department}</div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                                <span className="text-slate-400">Est. Wait: <span className="text-slate-800 dark:text-white font-semibold">{patient.waitingTime}m</span></span>
                                <span className="text-slate-400">Risk: <span className={cn(
                                    "font-bold",
                                    patient.riskLevel === "high" ? "text-red-500" :
                                        patient.riskLevel === "medium" ? "text-amber-500" : "text-emerald-500"
                                )}>
                                    {patient.riskLevel.toUpperCase()}
                                </span></span>
                            </div>
                        </div>

                        <DialogFooter className="gap-3 sm:gap-3">
                            <DialogClose asChild>
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleTransferConfirm}
                                disabled={isTransferring}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                            >
                                {isTransferring ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Transferring...
                                    </span>
                                ) : (
                                    'Confirm Transfer'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog >
            </div >
        </div >
    )
}
