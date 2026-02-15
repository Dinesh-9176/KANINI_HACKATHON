"use client"

import * as React from "react"
import { Bed, fetchBeds, assignBed } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BedDouble, CheckCircle2, UserPlus } from "lucide-react"

interface BedAllocationProps {
    departmentId: string
    patientId: string
    onAssign?: () => void
}

export function BedAllocation({ departmentId, patientId, onAssign }: BedAllocationProps) {
    const [beds, setBeds] = React.useState<Bed[]>([])
    const [loading, setLoading] = React.useState(false)
    const [assigning, setAssigning] = React.useState<string | null>(null)

    React.useEffect(() => {
        setLoading(true)
        fetchBeds(departmentId)
            .then(setBeds)
            .catch(err => console.error("Failed to fetch beds", err))
            .finally(() => setLoading(false))
    }, [departmentId])

    const handleAssign = async (bedId: string) => {
        setAssigning(bedId)
        try {
            await assignBed(bedId, patientId)
            // Refresh beds
            const updated = await fetchBeds(departmentId)
            setBeds(updated)
            if (onAssign) onAssign()
        } catch (err) {
            console.error("Failed to assign bed", err)
        } finally {
            setAssigning(null)
        }
    }

    if (loading) return <div className="text-sm text-muted-foreground animate-pulse">Checking bed availability...</div>

    if (beds.length === 0) {
        return (
            <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                No beds found for this department.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available Beds</h3>
                <Badge variant="outline" className="text-xs">
                    {beds.filter(b => !b.is_occupied).length} / {beds.length} Free
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {beds.map((bed) => {
                    const isOccupied = bed.is_occupied
                    // If occupied by THIS patient, show special state
                    const isMyBed = bed.current_patient_id === patientId

                    return (
                        <div
                            key={bed.id}
                            className={`
                                relative p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center
                                ${isMyBed
                                    ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                    : isOccupied
                                        ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                                        : "bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 border-border hover:border-primary/30 cursor-pointer group"
                                }
                            `}
                        >
                            <BedDouble className={`w-8 h-8 ${isMyBed ? "text-green-500" : isOccupied ? "text-slate-400" : "text-primary/70 group-hover:text-primary"}`} />

                            <div>
                                <div className="text-sm font-bold">{bed.bed_number}</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {isMyBed ? "Assigned" : isOccupied ? "Occupied" : "Available"}
                                </div>
                            </div>

                            {!isOccupied && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full h-7 mt-1 text-[10px] font-bold bg-primary/5 hover:bg-primary/10 text-primary"
                                    onClick={() => handleAssign(bed.id)}
                                    disabled={!!assigning}
                                >
                                    {assigning === bed.id ? "..." : "ASSIGN"}
                                </Button>
                            )}

                            {isMyBed && (
                                <div className="absolute top-1 right-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
