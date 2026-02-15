"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
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

// Triage Components
import { PatientDetails } from "@/components/triage/PatientDetails"

import { mockPatients, type Patient } from "@/lib/mockData"

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

export default function PatientsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get("id")

    // State for filters
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

    // Build the combined patient list (mock + latest from intake)
    const allPatients = React.useMemo(() => {
        const list = [...mockPatients]
        try {
            const saved = localStorage.getItem('latestPatient')
            if (saved) {
                const latest = JSON.parse(saved) as Patient
                // Only add if not already in mock data
                if (!list.find(p => p.id === latest.id)) {
                    list.unshift(latest) // Add to top
                }
            }
        } catch { /* ignore */ }
        return list
    }, [])

    // Derived Logic
    const filteredAndSortedPatients = React.useMemo(() => {
        let result = allPatients.filter(p => !removedIds.has(p.id))

        // 1. Search (Name or ID)
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.id.toLowerCase().includes(lower)
            )
        }

        // 2. Department Filter
        if (deptFilter !== "all") {
            result = result.filter(p => p.department === deptFilter)
        }

        // 3. Risk Filter
        if (riskFilter !== "all") {
            result = result.filter(p => p.riskLevel === riskFilter)
        }

        // 4. Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "priority":
                    return (b.priorityScore || 0) - (a.priorityScore || 0)
                case "waiting":
                    return b.waitingTime - a.waitingTime
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

        return result
    }, [allPatients, removedIds, searchTerm, deptFilter, riskFilter, sortBy])

    const handleRemovePatient = (patientId: string) => {
        setRemovedIds(prev => new Set(prev).add(patientId))
        setRemoveDialogId(null)
    }

    const handleViewPatient = (e: React.MouseEvent, patientId: string) => {
        e.stopPropagation()
        router.push(`/triage?id=${patientId}`)
    }

    // Find selected patient if ID is present
    const selectedPatient = React.useMemo(() => {
        if (!id) return undefined
        return allPatients.find((p) => p.id === id)
    }, [id, allPatients])

    // Get unique departments for filter dropdown
    const uniqueDepartments = React.useMemo(() => {
        const depts = new Set(allPatients.map(p => p.department))
        return Array.from(depts)
    }, [allPatients])

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
    const patientToRemove = removeDialogId ? allPatients.find(p => p.id === removeDialogId) : null

    // --- VIEW: Patient Details (Triage) ---
    if (selectedPatient) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/patients")}>
                        Back to Directory
                    </Button>
                    <h2 className="text-xl font-semibold">Patient Triage View</h2>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
                    <PatientDetails patient={selectedPatient} />
                </div>
            </div>
        )
    }

    // --- VIEW: Patient Directory ---
    return (
        <div className="space-y-6 h-full p-2">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-cyan-900">Patients</h2>
                <Button className="clay-button bg-cyan-700 hover:bg-cyan-600 text-white border-0 h-10 px-6 rounded-xl font-bold tracking-wide shadow-cyan-900/20" onClick={() => router.push('/intake')}>+ Add Patient</Button>
            </div>

            <div className="clay-card p-6 overflow-hidden">
                <div className="flex flex-col xl:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-700/50" />
                        <Input
                            placeholder="Search by name, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl clay-inset border-0 pl-10 h-12 focus-visible:ring-cyan-500/30 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        {/* Department Filter */}
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

                        {/* Risk Filter */}
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-[160px] h-12 rounded-xl border-slate-200 clay-button bg-white text-slate-600 font-medium">
                                <SelectValue placeholder="Risk Level" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white dark:bg-slate-800 z-50">
                                <SelectItem value="all">All Risks</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                                <SelectItem value="moderate">Moderate Risk</SelectItem>
                                <SelectItem value="low">Low Risk</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
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
                                    key={patient.id}
                                    className="border-slate-100 hover:bg-cyan-50/30 cursor-pointer transition-all duration-200"
                                    onClick={() => router.push(`/triage?id=${patient.id}`)}
                                >
                                    <TableCell className="font-bold text-slate-600">#{patient.id}</TableCell>
                                    <TableCell className="font-semibold text-slate-800">{patient.name}</TableCell>
                                    <TableCell className="text-slate-600">{patient.age}</TableCell>
                                    <TableCell className="text-slate-600">{patient.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={patient.riskLevel === 'high' ? 'destructive' : 'secondary'} className={cn("rounded-full px-3 py-0.5 font-bold shadow-sm", patient.riskLevel === 'high' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                                            {patient.riskLevel.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(patient.id)}
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-cyan-700">{patient.priorityScore}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-cyan-600/10 text-cyan-700 bg-cyan-50">
                                            {patient.waitingTime}m
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg hover:bg-cyan-100 text-cyan-600 text-xs font-semibold"
                                                onClick={(e) => handleViewPatient(e, patient.id)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg hover:bg-rose-100 text-rose-500 text-xs font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setRemoveDialogId(patient.id)
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

                {/* Empty State */}
                {filteredAndSortedPatients.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg font-semibold mb-1">No patients found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}

                {/* Pagination Mockup */}
                <div className="flex items-center justify-between py-6">
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {filteredAndSortedPatients.length} of {allPatients.length - removedIds.size} patients
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
