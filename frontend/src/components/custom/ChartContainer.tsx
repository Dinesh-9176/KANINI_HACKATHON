"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"

interface ChartContainerProps {
    title: string
    description?: string
    children: React.ReactElement
    className?: string
    height?: number | string
}

export function ChartContainer({
    title,
    description,
    children,
    className,
    height = 300
}: ChartContainerProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
