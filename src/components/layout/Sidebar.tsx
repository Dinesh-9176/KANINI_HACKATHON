"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    BarChart3,
    Settings,
    Menu,
    X
} from "lucide-react"

const sidebarItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/triage", icon: Stethoscope, label: "Live Triage" },
    { href: "/patients", icon: Users, label: "Patients" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = React.useState(false)

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
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-center border-b px-6">
                    <h1 className="text-xl font-bold text-primary tracking-tight">
                        Medi<span className="text-foreground">Care</span>
                    </h1>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {sidebarItems.map((item) => {
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

                <div className="p-4 border-t">
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
