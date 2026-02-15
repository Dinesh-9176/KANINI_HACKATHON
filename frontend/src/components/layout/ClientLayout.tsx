"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNavbar } from "@/components/layout/TopNavbar"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { LanguageProvider } from "@/lib/language-context"

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Check if we are on an auth page
    const isAuthPage = pathname === "/login" || pathname === "/signup"

    return (
        <ThemeProvider defaultTheme="light" storageKey="hospital-theme">
            <LanguageProvider>
                {isAuthPage ? (
                    <main className="min-h-screen bg-background flex items-center justify-center p-4">
                        {children}
                    </main>
                ) : (
                    <div className="flex min-h-screen bg-background relative transition-colors duration-300">
                        <Sidebar />
                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col w-full md:pl-64 transition-all duration-300 ease-in-out">
                            <TopNavbar />
                            <main className="flex-1 p-4 md:p-6 bg-secondary/30 text-foreground overflow-x-hidden">
                                {children}
                            </main>
                        </div>
                    </div>
                )}
            </LanguageProvider>
        </ThemeProvider>
    )
}
