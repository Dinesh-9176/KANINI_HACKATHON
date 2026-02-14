"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    Activity,
    ChevronDown,
    ChevronRight,
    CircleDot
} from "lucide-react"
import { mockPatients } from "@/lib/mockData"

const sidebarItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/intake", icon: Stethoscope, label: "Patient Intake" },
    // "Live Triage" is handled custom
    { href: "/patients", icon: Users, label: "Patients" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activePatientId = searchParams.get("id")
    const [isOpen, setIsOpen] = React.useState(false) // Mobile sidebar state
    const [isTriageOpen, setIsTriageOpen] = React.useState(true) // Triage sub-menu state

    // Check if we are on the triage page
    const isTriageActive = pathname === "/triage"

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-3 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </Button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-center border-b px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-primary tracking-tight">
                        Medi<span className="text-foreground">Care</span>
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {/* Standard Items (First Batch) */}
                    {sidebarItems.slice(0, 2).map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}

                    {/* Live Triage Group */}
                    <div className="pt-2 pb-2">
                        <button
                            onClick={() => setIsTriageOpen(!isTriageOpen)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                                isTriageActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Activity className={cn("h-4 w-4", isTriageActive && "text-primary")} />
                                Live Triage
                            </div>
                            {isTriageOpen ? (
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            ) : (
                                <ChevronRight className="h-4 w-4 opacity-50" />
                            )}
                        </button>

                        {/* Collapsible Patient List */}
                        {isTriageOpen && (
                            <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                                {mockPatients.map((patient) => {
                                    const isActive = isTriageActive && activePatientId === patient.id
                                    // Determine status color
                                    const statusColor = patient.riskLevel === "high" ? "text-red-500" :
                                        patient.riskLevel === "medium" ? "text-yellow-500" : "text-green-500"

                                    return (
                                        <Link
                                            key={patient.id}
                                            href={`/triage?id=${patient.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                                                isActive ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground"
                                            )}
                                        >
                                            <span className="truncate">{patient.name}</span>
                                            <CircleDot className={cn("h-2 h-2 opacity-70", statusColor)} />
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Remaining Standard Items */}
                    {sidebarItems.slice(2).map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t flex-shrink-0">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">DR</span>
                        </div>
                        <div className="text-xs">
                            <div className="font-semibold">Dr. Smith</div>
                            <div className="text-muted-foreground">Chief Medical Officer</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
