import * as React from "react"
import { Clock, Activity, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Patient {
    id: string
    name: string
    age: number
    gender: string
    riskLevel: "high" | "medium" | "low"
    priorityScore: number
    waitingTime: number // in minutes
    department: string
    confidence: number
}

interface PatientCardProps extends React.HTMLAttributes<HTMLDivElement> {
    patient: Patient
    isActive?: boolean
    onClick?: () => void
}

export function PatientCard({ patient, isActive, className, onClick, ...props }: PatientCardProps) {
    return (
        <Card
            onClick={onClick}
            className={cn(
                "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md",
                isActive && "border-primary bg-primary/5 shadow-md",
                className
            )}
            {...props}
        >
            <CardContent className="p-4 space-y-3">
                {/* Header: Name, Age, Risk Badge */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg leading-tight">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.age} yrs • {patient.gender}</p>
                    </div>
                    <Badge variant={patient.riskLevel}>
                        {patient.riskLevel.toUpperCase()}
                    </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{patient.priorityScore}</span>
                        <span className="text-xs">Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-foreground">{patient.waitingTime}m</span>
                        <span className="text-xs">Wait</span>
                    </div>
                </div>

                {/* Footer: Dept & Confidence */}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <Badge variant="outline" className="text-xs font-normal">
                        {patient.department}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>{patient.confidence}% AI Confidence</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
