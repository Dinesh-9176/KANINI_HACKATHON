"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockRooms, mockLabs } from "@/lib/mockData"
import { Activity, Bed, Microscope } from "lucide-react"

export function ResourceStatus() {
    // Calculate stats
    const totalRooms = mockRooms.length
    const occupiedRooms = mockRooms.filter(r => r.isOccupied).length
    const availableRooms = totalRooms - occupiedRooms
    const roomCapacity = Math.round((occupiedRooms / totalRooms) * 100)

    const labsBusy = mockLabs.filter(l => l.status === "Busy").length
    const labsAvailable = mockLabs.filter(l => l.status === "Available").length

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-500" />
                Hospital Resources
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {/* Room Status */}
                <div className="clay-card p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <Bed className="h-4 w-4" />
                        </div>
                        <Badge variant={roomCapacity > 80 ? "destructive" : "secondary"} className="text-[10px]">
                            {roomCapacity}% Full
                        </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {availableRooms} <span className="text-sm font-medium text-slate-400">/ {totalRooms}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">
                        Beds Available
                    </div>
                </div>

                {/* Lab Status */}
                <div className="clay-card p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                            <Microscope className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                            {labsAvailable} Active
                        </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {labsBusy}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">
                        Labs Busy
                    </div>
                </div>
            </div>

            {/* Detailed List */}
            <div className="clay-card p-4 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                    Critical Units
                </div>
                {mockRooms.filter(r => r.type === "Trauma" || r.type === "ICU").map(room => (
                    <div key={room.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{room.name}</span>
                        {room.isOccupied ? (
                            <span className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                OCCUPIED
                            </span>
                        ) : (
                            <span className="text-xs text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                FREE
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
