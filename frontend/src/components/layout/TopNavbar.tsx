"use client"

import * as React from "react"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNavbar() {
    const router = useRouter()

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-slate-200/50 bg-background pl-16 pr-6 md:px-6 shadow-sm">
            <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                {/* Global Search */}
                <div className="relative flex-1 md:grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-700/50" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-2xl clay-inset border-0 pl-10 md:w-[200px] lg:w-[320px] focus-visible:ring-cyan-500/30 placeholder:text-slate-400"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative clay-button rounded-xl h-10 w-10 text-cyan-700 hover:text-cyan-900 border-0 bg-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
                        <span className="sr-only">Notifications</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="clay-button rounded-xl h-10 w-10 text-cyan-700 bg-white hover:text-cyan-900 focus-visible:ring-0 focus-visible:ring-offset-0">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl bg-white dark:bg-slate-800 z-50">
                            <DropdownMenuLabel className="font-bold text-cyan-900">My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer font-medium text-slate-600 focus:bg-cyan-50 focus:text-cyan-900">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer font-medium text-slate-600 focus:bg-cyan-50 focus:text-cyan-900">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                onClick={() => router.push('/login')}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
