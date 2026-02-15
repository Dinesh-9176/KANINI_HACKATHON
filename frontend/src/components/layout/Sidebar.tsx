"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"
import {
    Menu,
    X,
    ChevronDown,
    ChevronRight,
} from "lucide-react"
import { mockPatients } from "@/lib/mockData"

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { t } = useTranslation()
    const activePatientId = searchParams.get("id")
    const [isOpen, setIsOpen] = React.useState(false) // Mobile sidebar state
    const [isTriageOpen, setIsTriageOpen] = React.useState(true) // Triage sub-menu state

    // Check if we are on the triage page
    const isTriageActive = pathname === "/triage"

    const sidebarItems = [
        { href: "/", label: t("nav_home") },
        { href: "/intake", label: t("nav_intake") },
        // "Live Triage" is handled custom
        { href: "/patients", label: t("nav_patients") },
        { href: "/analytics", label: t("nav_analytics") },
        { href: "/settings", label: t("nav_settings") },
    ]

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
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r border-slate-200/50 transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col shadow-xl md:shadow-none",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-center border-b border-slate-200/50 px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-cyan-900 tracking-tight flex items-center gap-1">
                        Hospital<span className="text-cyan-600">System</span>
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* Main Navigation */}
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href === "/patients" && pathname.startsWith("/patients"))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "clay-inset text-cyan-900 font-bold"
                                        : "text-slate-500 hover:text-cyan-700 hover:bg-cyan-50/50"
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200/50 flex-shrink-0">
                    <div className="flex items-center gap-3 rounded-2xl clay-card p-3 border-0">
                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center shadow-inner">
                            <span className="text-xs font-bold text-cyan-700">DR</span>
                        </div>
                        <div className="text-xs">
                            <div className="font-bold text-slate-800">Dr. Smith</div>
                            <div className="text-slate-500">Chief Medical Officer</div>
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
