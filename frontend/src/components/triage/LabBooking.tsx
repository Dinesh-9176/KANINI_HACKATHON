"use client"

import * as React from "react"
import { Lab, fetchLabs, bookLab } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TestTube2, FlaskConical, Microscope, Clock } from "lucide-react"

interface LabBookingProps {
    patientId: string
}

export function LabBooking({ patientId }: LabBookingProps) {
    const [labs, setLabs] = React.useState<Lab[]>([])
    const [loading, setLoading] = React.useState(false)
    const [booking, setBooking] = React.useState<string | null>(null)
    const [bookedLabs, setBookedLabs] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        setLoading(true)
        fetchLabs()
            .then(setLabs)
            .catch(err => console.error("Failed to fetch labs", err))
            .finally(() => setLoading(false))
    }, [])

    const handleBook = async (labId: string) => {
        setBooking(labId)
        try {
            await bookLab(labId, patientId)
            setBookedLabs(prev => new Set(prev).add(labId))
        } catch (err) {
            console.error("Failed to book lab", err)
        } finally {
            setBooking(null)
        }
    }

    if (loading) return <div className="text-sm text-muted-foreground animate-pulse">Loading lab services...</div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lab & Diagnostics</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {labs.map((lab) => {
                    const isBooked = bookedLabs.has(lab.id)
                    const Icon = lab.type === 'radiology' ? Microscope : lab.type === 'pathology' ? FlaskConical : TestTube2

                    return (
                        <div
                            key={lab.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isBooked ? "bg-green-500/10 border-green-500/20" : "bg-black/20 border-white/5 hover:bg-black/30"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isBooked ? "bg-green-500/20 text-green-500" : "bg-slate-800 text-slate-400"}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-slate-200">{lab.name}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">{lab.type}</div>
                                </div>
                            </div>

                            {isBooked ? (
                                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 gap-1">
                                    <Clock className="w-3 h-3" /> Booked
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700"
                                    onClick={() => handleBook(lab.id)}
                                    disabled={!!booking || !lab.is_available}
                                >
                                    {booking === lab.id ? "..." : "Schedule"}
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
