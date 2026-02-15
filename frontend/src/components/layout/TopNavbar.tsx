"use client"

import * as React from "react"
import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TopNavbar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                {/* Global Search */}
                <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search patients, doctors..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
                        <span className="sr-only">Notifications</span>
                    </Button>

                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
