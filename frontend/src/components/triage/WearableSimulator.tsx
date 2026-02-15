"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Watch, Heart, Activity, Bluetooth, CheckCircle2, RotateCw } from "lucide-react"

interface WearableSimulatorProps {
    onSync: (vitals: { hr: number, bpSys: number, bpDia: number, spo2: number }) => void
}

export function WearableSimulator({ onSync }: WearableSimulatorProps) {
    const [status, setStatus] = React.useState<"disconnected" | "scanning" | "connected">("disconnected")
    const [scannedDevice, setScannedDevice] = React.useState<string | null>(null)

    const handleScan = () => {
        setStatus("scanning")
        setTimeout(() => {
            setScannedDevice("Galaxy Watch 6")
        }, 1500)
    }

    const handleConnect = () => {
        setStatus("connected")
        // Simulate fetching vitals
        setTimeout(() => {
            const vitals = {
                hr: Math.floor(Math.random() * (110 - 60) + 60),
                bpSys: Math.floor(Math.random() * (140 - 110) + 110),
                bpDia: Math.floor(Math.random() * (90 - 70) + 70),
                spo2: Math.floor(Math.random() * (100 - 95) + 95)
            }
            onSync(vitals)
        }, 1000)
    }

    return (
        <div className="clay-card p-6 border-2 border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                    <Watch className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Wearable Integration</h3>
                    <p className="text-xs text-slate-500">Sync vital signs from smartwatch</p>
                </div>
            </div>

            {status === "disconnected" && !scannedDevice && (
                <div className="text-center py-4 space-y-3">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Bluetooth className="w-8 h-8 text-slate-400" />
                    </div>
                    <Button onClick={handleScan} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Scan for Devices
                    </Button>
                </div>
            )}

            {status === "scanning" && !scannedDevice && (
                <div className="text-center py-6 space-y-3">
                    <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-sm font-medium text-slate-500">Scanning via Bluetooth...</p>
                </div>
            )}

            {scannedDevice && status !== "connected" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-3">
                            <Watch className="w-5 h-5 text-slate-600" />
                            <span className="font-semibold">{scannedDevice}</span>
                        </div>
                        <Button size="sm" onClick={handleConnect}>Connect</Button>
                    </div>
                    <p className="text-xs text-center text-slate-400">Tap to sync recent health data</p>
                </div>
            )}

            {status === "connected" && (
                <div className="text-center py-4 space-y-2">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-green-700 dark:text-green-400">Data Synced!</h4>
                    <p className="text-xs text-slate-500">Vitals updated from {scannedDevice}</p>
                    <Button variant="ghost" size="sm" onClick={() => { setStatus("disconnected"); setScannedDevice(null) }} className="text-slate-400 hover:text-red-500">
                        Disconnect
                    </Button>
                </div>
            )}
        </div>
    )
}
