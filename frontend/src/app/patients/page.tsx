"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, Loader2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientDetails } from "@/components/triage/PatientDetails"
import { SimpleTooltip } from "@/components/ui/simple-tooltip"
import { getContributingFactors } from "@/lib/triageUtils"
import { fetchPatients, fetchPatient, type QueuePatient, type PatientDetail } from "@/lib/api"
import type { Patient } from "@/lib/mockData"

function queueToPatient(q: QueuePatient): Patient {
    return {
        id: q.patient_code,
        name: q.name,
        age: q.age,
        gender: q.gender,
        riskLevel: q.risk_level as "high" | "medium" | "low",
        priorityScore: q.priority_score,
        waitingTime: q.waiting_time,
        department: q.department_name || "General Medicine",
        confidence: q.confidence,
        symptoms: [],
        vitals: { hr: 75, bp: "120/80", spo2: 98, temp: 98.6 },
    }
}

// Status type for patient tracking
interface PatientStatus {
    attended?: boolean
    transferred?: boolean
    transferDept?: string
}

function getPatientStatuses(): Record<string, PatientStatus> {
    try {
        const saved = localStorage.getItem('patientStatuses')
        return saved ? JSON.parse(saved) : {}
    } catch {
        return {}
    }
}

function PatientsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get("id")

    const [patients, setPatients] = React.useState<QueuePatient[]>([])
    const [loading, setLoading] = React.useState(true)
    const [selectedDetail, setSelectedDetail] = React.useState<PatientDetail | null>(null)
    const [detailLoading, setDetailLoading] = React.useState(false)

    // Filters
    const [searchTerm, setSearchTerm] = React.useState("")
    const [sortBy, setSortBy] = React.useState("priority")
    const [deptFilter, setDeptFilter] = React.useState("all")
    const [riskFilter, setRiskFilter] = React.useState("all")

    // Removable patient list
    const [removedIds, setRemovedIds] = React.useState<Set<string>>(new Set())
    const [removeDialogId, setRemoveDialogId] = React.useState<string | null>(null)

    // Patient statuses from localStorage
    const [statuses, setStatuses] = React.useState<Record<string, PatientStatus>>({})

    // Load statuses from localStorage on mount and periodically
    React.useEffect(() => {
        setStatuses(getPatientStatuses())
        const interval = setInterval(() => {
            setStatuses(getPatientStatuses())
        }, 2000) // Poll every 2s to sync with triage page changes
        return () => clearInterval(interval)
    }, [])

    // Fetch patients list
    React.useEffect(() => {
        fetchPatients()
            .then(setPatients)
            .catch((e) => console.error("Failed to fetch patients:", e))
            .finally(() => setLoading(false))
    }, [])

    // Fetch selected patient detail
    React.useEffect(() => {
        if (!id) {
            setSelectedDetail(null)
            return
        }
        setDetailLoading(true)
        fetchPatient(id)
            .then(setSelectedDetail)
            .catch((e) => console.error("Failed to fetch patient:", e))
            .finally(() => setDetailLoading(false))
    }, [id])

    const filteredAndSortedPatients = React.useMemo(() => {
        let result = [...patients].filter(p => !removedIds.has(p.patient_code))

        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.patient_code.toLowerCase().includes(lower)
            )
        }

        if (deptFilter !== "all") {
            result = result.filter(p => p.department_name === deptFilter)
        }

        if (riskFilter !== "all") {
            result = result.filter(p => p.risk_level === riskFilter)
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "priority":
                    return (b.priority_score || 0) - (a.priority_score || 0)
                case "waiting":
                    return b.waiting_time - a.waiting_time
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

        return result
    }, [patients, removedIds, searchTerm, deptFilter, riskFilter, sortBy])

    const handleRemovePatient = (patientId: string) => {
        setRemovedIds(prev => new Set(prev).add(patientId))
        setRemoveDialogId(null)
    }

    const handleViewPatient = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation()
        router.push(`/patients?id=${patientId}`)
    }

    const uniqueDepartments = React.useMemo(() => {
        const depts = new Set(patients.map(p => p.department_name).filter(Boolean))
        return Array.from(depts)
    }, [patients])

    // Get status badge for a patient
    const getStatusBadge = (patientId: string) => {
        const status = statuses[patientId]
        if (status?.transferred) {
            return (
                <Badge className="rounded-full px-3 py-0.5 font-bold shadow-sm bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Transferred
                </Badge>
            )
        }
        if (status?.attended) {
            return (
                <Badge className="rounded-full px-3 py-0.5 font-bold shadow-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Attended
                </Badge>
            )
        }
        return (
            <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-bold shadow-sm bg-amber-50 text-amber-600 hover:bg-amber-100 border-0">
                Pending
            </Badge>
        )
    }

    // Patient removed name for dialog
    const patientToRemove = removeDialogId ? patients.find(p => p.patient_code === removeDialogId) : null

    // --- Patient Detail View ---
    if (id && selectedDetail) {
        const intake = selectedDetail.intake
        const triage = selectedDetail.triage
        const p = selectedDetail.patient

        const patient: Patient = {
            id: p.patient_code,
            name: p.name,
            age: p.age,
            gender: p.gender,
            riskLevel: (triage?.risk_level || "low") as "high" | "medium" | "low",
            priorityScore: triage?.priority_score || 0,
            waitingTime: triage?.waiting_time || 0,
            department: selectedDetail.department_name,
            confidence: triage?.confidence || 0,
            symptoms: intake?.symptoms || [],
            vitals: {
                hr: intake?.heart_rate || 75,
                bp: `${intake?.blood_pressure_systolic || 120}/${intake?.blood_pressure_diastolic || 80}`,
                spo2: intake?.oxygen_saturation || 98,
                temp: intake?.temperature || 98.6,
            },
        }

        const factors = selectedDetail.contributing_factors.map(f => ({
            name: f.name,
            value: f.value,
            impact: f.impact,
            isPositive: f.is_positive,
        }))

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/patients")}>
                        Back to Directory
                    </Button>
                    <h2 className="text-xl font-semibold">Patient Triage View</h2>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
                    <PatientDetails
                        patient={patient}
                        contributingFactors={factors.length > 0 ? factors : undefined}
                        predictedDisease={triage?.predicted_disease}
                    />
                </div>
            </div>
        )
    }

    if (id && detailLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // --- Patient Directory View ---
    return (
        <div className="space-y-6 h-full p-2">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-cyan-900">Patients</h2>
                <Button className="clay-button bg-cyan-700 hover:bg-cyan-600 text-white border-0 h-10 px-6 rounded-xl font-bold tracking-wide shadow-cyan-900/20" onClick={() => router.push('/intake')}>+ Add Patient</Button>
            </div>

            <div className="clay-card p-6 overflow-hidden">
                <div className="flex flex-col xl:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-700/50" />
                        <Input
                            placeholder="Search by name, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl clay-inset border-0 pl-10 h-12 focus-visible:ring-cyan-500/30 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-xl border-slate-200 clay-button bg-white text-slate-600 font-medium">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white dark:bg-slate-800 z-50">
                                <SelectItem value="all">All Departments</SelectItem>
                                {uniqueDepartments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-[160px] h-12 rounded-xl border-slate-200 clay-button bg-white text-slate-600 font-medium">
                                <SelectValue placeholder="Risk Level" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white dark:bg-slate-800 z-50">
                                <SelectItem value="all">All Risks</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                                <SelectItem value="medium">Medium Risk</SelectItem>
                                <SelectItem value="low">Low Risk</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] h-12 rounded-xl border-slate-200 clay-button bg-white text-slate-600 font-medium">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white dark:bg-slate-800 z-50">
                                <SelectItem value="priority">Priority (High-Low)</SelectItem>
                                <SelectItem value="waiting">Wait Time (Long-Short)</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredAndSortedPatients.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg font-semibold mb-1">No patients found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="rounded-xl overflow-hidden overflow-x-auto border border-slate-100">
                        <Table>
                            <TableHeader className="bg-cyan-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider py-4">ID</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Name</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Age</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Department</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Risk Level</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Status</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Priority</TableHead>
                                    <TableHead className="font-bold text-cyan-900 uppercase text-xs tracking-wider">Wait Time</TableHead>
                                    <TableHead className="text-right font-bold text-cyan-900 uppercase text-xs tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedPatients.map((patient) => (
                                    <TableRow
                                        key={patient.patient_code}
                                        className="border-slate-100 hover:bg-cyan-50/30 cursor-pointer transition-all duration-200"
                                        onClick={() => router.push(`/patients?id=${patient.patient_code}`)}
                                    >
                                        <TableCell className="font-bold text-slate-600">#{patient.patient_code}</TableCell>
                                        <TableCell className="font-semibold text-slate-800">{patient.name}</TableCell>
                                        <TableCell className="text-slate-600">{patient.age}</TableCell>
                                        <TableCell className="text-slate-600">{patient.department_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={patient.risk_level === 'high' ? 'destructive' : 'secondary'} className={cn("rounded-full px-3 py-0.5 font-bold shadow-sm", patient.risk_level === 'high' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : patient.risk_level === 'medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')}>
                                                {patient.risk_level.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(patient.patient_code)}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-cyan-700">
                                            <SimpleTooltip className="cursor-help" content={
                                                <div className="space-y-1 min-w-[200px]">
                                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-1 mb-2">
                                                        Why this Priority?
                                                    </div>
                                                    {getContributingFactors(queueToPatient(patient)).slice(0, 3).map((f, i) => (
                                                        <div key={i} className="flex justify-between items-center gap-4 text-xs">
                                                            <span className="text-slate-300">{f.name}</span>
                                                            <span className={cn("font-mono", f.isPositive ? "text-emerald-400" : "text-rose-400")}>{f.value}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 mt-1 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                                                        Click to view full analysis
                                                    </div>
                                                </div>
                                            }>
                                                <span className="border-b border-dotted border-cyan-400/50 hover:border-cyan-600 transition-colors">
                                                    {patient.priority_score}
                                                </span>
                                            </SimpleTooltip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-cyan-600/10 text-cyan-700 bg-cyan-50">
                                                {patient.waiting_time}m
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 rounded-lg hover:bg-cyan-100 text-cyan-600 text-xs font-semibold"
                                                    onClick={(e) => handleViewPatient(e, patient.patient_code)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 rounded-lg hover:bg-rose-100 text-rose-500 text-xs font-semibold"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setRemoveDialogId(patient.patient_code)
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="flex items-center justify-between py-6">
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {filteredAndSortedPatients.length} of {patients.length - removedIds.size} patients
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="rounded-xl border-slate-200 text-slate-400">Previous</Button>
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 hover:text-cyan-700 hover:border-cyan-200 hover:bg-cyan-50">Next</Button>
                    </div>
                </div>
            </div>

            {/* Remove Confirmation Dialog */}
            <Dialog open={removeDialogId !== null} onOpenChange={(open) => { if (!open) setRemoveDialogId(null) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Patient</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove <span className="font-semibold text-foreground">{patientToRemove?.name}</span> from the patient directory? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 sm:gap-3">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => removeDialogId && handleRemovePatient(removeDialogId)}
                            className="bg-rose-600 hover:bg-rose-500"
                        >
                            Remove Patient
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function PatientsPage() {
    return (
        <React.Suspense fallback={<div className="p-4">Loading patients...</div>}>
            <PatientsContent />
        </React.Suspense>
    )
}
