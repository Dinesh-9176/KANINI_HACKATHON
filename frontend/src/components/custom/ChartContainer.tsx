"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface ChartContainerProps {
    title: string
    description?: string
    children: React.ReactElement
    className?: string
    height?: number | string
    icon?: React.ReactNode
}

export function ChartContainer({
    title,
    description,
    children,
    className,
    height = 300,
    icon
}: ChartContainerProps) {
    return (
        <div className={cn("clay-card p-6", className)}>
            <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>
                )}
            </div>
            <div style={{ height }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
