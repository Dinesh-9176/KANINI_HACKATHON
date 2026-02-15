"use client"

import * as React from "react"

// Icons removed

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { fetchDepartments, type Department as APIDepartment } from "@/lib/api"

interface Department {
    id: string
    name: string
    // Icon removed
    capacity: number // 0-100
    waitTime: number // minutes
    isRecommended: boolean
    description: string
    doctors: number
    isEmergency: boolean
}

const DEPARTMENTS: Department[] = [
    {
        id: "emergency",
        name: "Emergency / ICU",
        capacity: 95,
        waitTime: 45,
        isRecommended: false,
        description: "Critical care & trauma",
        doctors: 12,
        isEmergency: true
    },
    {
        id: "trauma",
        name: "Trauma",
        capacity: 88,
        waitTime: 35,
        isRecommended: false,
        description: "Severe physical injuries",
        doctors: 8,
        isEmergency: true
    },
    {
        id: "cardiology",
        name: "Cardiology",
        capacity: 72,
        waitTime: 25,
        isRecommended: true,
        description: "Heart & cardiovascular",
        doctors: 5,
        isEmergency: false
    },
    {
        id: "neurology",
        name: "Neurology",
        capacity: 58,
        waitTime: 20,
        isRecommended: false,
        description: "Brain & nervous system",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "pulmonology",
        name: "Pulmonology",
        capacity: 52,
        waitTime: 22,
        isRecommended: false,
        description: "Respiratory & lungs",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "obgyn",
        name: "OB-GYN",
        capacity: 45,
        waitTime: 15,
        isRecommended: false,
        description: "Obstetrics & Gynecology",
        doctors: 6,
        isEmergency: false
    },
    {
        id: "infectious",
        name: "Infectious Disease",
        capacity: 35,
        waitTime: 10,
        isRecommended: false,
        description: "Viral & bacterial infections",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "nephrology",
        name: "Nephrology",
        capacity: 60,
        waitTime: 28,
        isRecommended: false,
        description: "Kidney care",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "gastroenterology",
        name: "Gastroenterology",
        capacity: 55,
        waitTime: 18,
        isRecommended: false,
        description: "Digestive system",
        doctors: 5,
        isEmergency: false
    },
    {
        id: "endocrinology",
        name: "Endocrinology",
        capacity: 40,
        waitTime: 12,
        isRecommended: false,
        description: "Hormone disorders",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "ent",
        name: "ENT",
        capacity: 30,
        waitTime: 15,
        isRecommended: false,
        description: "Ear, Nose, Throat",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "urology",
        name: "Urology",
        capacity: 42,
        waitTime: 20,
        isRecommended: false,
        description: "Urinary tract",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "orthopedics",
        name: "Orthopedics",
        capacity: 65,
        waitTime: 30,
        isRecommended: false,
        description: "Bones, joints & muscles",
        doctors: 6,
        isEmergency: false
    },
    {
        id: "pediatrics_geriatrics",
        name: "Pediatrics / Geriatrics",
        capacity: 50,
        waitTime: 10,
        isRecommended: false,
        description: "Child & elderly care",
        doctors: 7,
        isEmergency: false
    },
    {
        id: "psychiatry",
        name: "Psychiatry",
        capacity: 20,
        waitTime: 5,
        isRecommended: false,
        description: "Mental health",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "dermatology",
        name: "Dermatology",
        capacity: 25,
        waitTime: 15,
        isRecommended: false,
        description: "Skin conditions",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "physiotherapy",
        name: "Physiotherapy",
        capacity: 30,
        waitTime: 8,
        isRecommended: false,
        description: "Physical rehabilitation",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "general",
        name: "General Medicine",
        capacity: 80,
        waitTime: 40,
        isRecommended: false,
        description: "Primary care",
        doctors: 10,
        isEmergency: false
    }
]

function getCapacityColor(capacity: number): string {
    if (capacity >= 90) return "text-red-600 dark:text-red-400"
    if (capacity >= 70) return "text-orange-600 dark:text-orange-400"
    return "text-green-600 dark:text-green-400"
}

function getCapacityBgColor(capacity: number): string {
    if (capacity >= 90) return "bg-red-600 dark:bg-red-500"
    if (capacity >= 70) return "bg-orange-600 dark:bg-orange-500"
    return "bg-green-600 dark:bg-green-500"
}

interface DepartmentRecommendationsProps {
    recommendedDept?: string
}

export function DepartmentRecommendations({ recommendedDept }: DepartmentRecommendationsProps) {
    const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
    const [selectedDept, setSelectedDept] = React.useState<Department | null>(null)
    const [isTransferring, setIsTransferring] = React.useState(false)
    const [transferredDeptId, setTransferredDeptId] = React.useState<string | null>(null)
    const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
    const [apiDepts, setApiDepts] = React.useState<APIDepartment[]>([])

    React.useEffect(() => {
        fetchDepartments()
            .then(setApiDepts)
            .catch(() => {}) // Fall back to hardcoded
    }, [])

    const departments = React.useMemo(() => {
        // Use API data if available, otherwise fallback to hardcoded
        const source: Department[] = apiDepts.length > 0
            ? apiDepts.map(d => ({
                id: d.id,
                name: d.name,
                capacity: d.capacity_pct ?? Math.floor(Math.random() * 60 + 20),
                waitTime: d.wait_time_mins ?? Math.floor(Math.random() * 30 + 5),
                isRecommended: false,
                description: d.description || "",
                doctors: d.active_doctors ?? Math.floor(Math.random() * 6 + 2),
                isEmergency: d.is_emergency,
            }))
            : DEPARTMENTS

        if (recommendedDept) {
            return source.map(dept => ({
                ...dept,
                isRecommended: dept.id === recommendedDept,
            }))
        }
        return source
    }, [recommendedDept, apiDepts])

    const recommended = departments.find(d => d.isRecommended)

    // Auto-dismiss status message
    React.useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [statusMessage])

    const handleInitiateTransfer = (dept: Department) => {
        setSelectedDept(dept)
        setShowConfirmDialog(true)
    }

    const handleConfirmTransfer = () => {
        if (!selectedDept) return
        setIsTransferring(true)
        setTimeout(() => {
            setIsTransferring(false)
            setTransferredDeptId(selectedDept.id)
            setShowConfirmDialog(false)
            setStatusMessage(`Patient transferred to ${selectedDept.name}`)
        }, 1500)
    }

    const handleDeptClick = (dept: Department) => {
        if (transferredDeptId) return // already transferred
        handleInitiateTransfer(dept)
    }

    return (
        <div className="h-full flex flex-col space-y-6 pt-4 bg-transparent p-6 rounded-l-none">
            {/* Status Toast */}
            {statusMessage && (
                <div className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-lg bg-emerald-950/90 border-emerald-500/30 text-emerald-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-sm font-semibold">{statusMessage}</span>
                    </div>
                </div>
            )}

            {/* Recommended Department Highlight */}
            {recommended && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Top Recommendation</h3>
                    <div className={cn(
                        "p-5 rounded-2xl border shadow-[0_0_30px_rgba(37,99,235,0.15)] relative overflow-hidden group",
                        transferredDeptId === recommended.id
                            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-emerald-900/10"
                            : "border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-900/10"
                    )}>
                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 blur-2xl" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-2xl text-white leading-none tracking-tight">{recommended.name}</h3>
                                    <p className="text-sm text-blue-200/70 mt-1.5 font-medium">{recommended.description}</p>
                                </div>
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shadow-lg",
                                    transferredDeptId === recommended.id
                                        ? "bg-emerald-500 shadow-emerald-500/30"
                                        : "bg-blue-500 shadow-blue-500/30"
                                )}>
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-black/20 p-3 rounded-lg border border-blue-400/10 backdrop-blur-md hover:bg-black/30 transition-colors animate-in zoom-in-50 duration-500 delay-500">
                                    <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Est. Wait</div>
                                    <div className="text-xl font-bold text-white mt-0.5">{recommended.waitTime} <span className="text-xs font-normal text-slate-400">min</span></div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg border border-blue-400/10 backdrop-blur-md hover:bg-black/30 transition-colors animate-in zoom-in-50 duration-500 delay-700">
                                    <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Staffing</div>
                                    <div className="text-xl font-bold text-white mt-0.5">{recommended.doctors} <span className="text-xs font-normal text-slate-400">Drs</span></div>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleInitiateTransfer(recommended)}
                                disabled={transferredDeptId !== null}
                                className={cn(
                                    "w-full mt-5 border-0 font-bold tracking-wide h-10 animate-in slide-in-from-bottom-2 duration-700 delay-1000 fill-mode-backwards transition-all",
                                    transferredDeptId === recommended.id
                                        ? "bg-emerald-500 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 cursor-default"
                                        : transferredDeptId
                                            ? "bg-slate-600 hover:bg-slate-600 text-slate-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25"
                                )}
                            >
                                {transferredDeptId === recommended.id ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        TRANSFER INITIATED
                                    </span>
                                ) : transferredDeptId ? (
                                    'PATIENT TRANSFERRED'
                                ) : (
                                    'INITIATE TRANSFER'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Departments List */}
            <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] px-1">Department Status</h4>
                <div className="space-y-2">
                    {departments.filter(d => !d.isRecommended).map((dept, i) => (
                        <div
                            key={dept.id}
                            onClick={() => handleDeptClick(dept)}
                            className={cn(
                                "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group",
                                transferredDeptId === dept.id
                                    ? "border-emerald-500/30 bg-emerald-900/20"
                                    : "border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors truncate">{dept.name}</span>
                                    {dept.isEmergency && <span className="h-4 px-1.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider border border-red-500/20 flex items-center">Emerg</span>}
                                    {transferredDeptId === dept.id && (
                                        <span className="h-4 px-1.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Transferred
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span>{dept.doctors} Active Drs</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className={dept.capacity > 80 ? "text-orange-400" : "text-slate-400"}>{dept.waitTime}m wait</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                                <span className={cn("text-xs font-bold", getCapacityColor(dept.capacity))}>{dept.capacity}%</span>
                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full shadow-[0_0_5px_currentColor]", getCapacityBgColor(dept.capacity))} style={{ width: `${dept.capacity}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transfer Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Initiate Department Transfer</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Confirm transfer to the selected department.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDept && (
                        <div className="my-4 p-4 rounded-xl bg-blue-950/50 border border-blue-500/20">
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Transfer To</div>
                            <div className="text-xl font-bold text-white">{selectedDept.name}</div>
                            <p className="text-sm text-blue-200/70 mt-1">{selectedDept.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                                <span className="text-slate-400">Wait: <span className="text-white font-semibold">{selectedDept.waitTime}m</span></span>
                                <span className="text-slate-400">Capacity: <span className={cn(
                                    "font-semibold",
                                    selectedDept.capacity >= 90 ? 'text-red-400' : selectedDept.capacity >= 70 ? 'text-amber-400' : 'text-emerald-400'
                                )}>{selectedDept.capacity}%</span></span>
                                <span className="text-slate-400">Doctors: <span className="text-white font-semibold">{selectedDept.doctors}</span></span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleConfirmTransfer}
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
            </Dialog>
        </div>
    )
}
