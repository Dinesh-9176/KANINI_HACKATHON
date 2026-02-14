"use client"

import * as React from "react"
import {
    Building2,
    MapPin,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle2,
    Activity,
    Brain,
    Heart,
    Bone,
    Baby,
    Eye,
    Wind,
    Utensils,
    Pill,
    Ambulance,
    ChevronRight,
    Zap,
    Cross
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Department {
    id: string
    name: string
    icon: React.ElementType
    capacity: number // 0-100
    waitTime: number // minutes
    isRecommended: boolean
    description: string
    doctors: number
    isEmergency: boolean
}

const DEPARTMENTS: Department[] = [
    {
        id: "emergency",
        name: "Emergency",
        icon: Ambulance,
        capacity: 95,
        waitTime: 45,
        isRecommended: false,
        description: "Critical care & trauma",
        doctors: 8,
        isEmergency: true
    },
    {
        id: "cardiology",
        name: "Cardiology",
        icon: Heart,
        capacity: 72,
        waitTime: 25,
        isRecommended: true,
        description: "Heart & cardiovascular",
        doctors: 5,
        isEmergency: false
    },
    {
        id: "neurology",
        name: "Neurology",
        icon: Brain,
        capacity: 58,
        waitTime: 20,
        isRecommended: false,
        description: "Brain & nervous system",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "orthopedics",
        name: "Orthopedics",
        icon: Bone,
        capacity: 65,
        waitTime: 30,
        isRecommended: false,
        description: "Bones, joints & muscles",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "general",
        name: "General Medicine",
        icon: Utensils,
        capacity: 45,
        waitTime: 15,
        isRecommended: false,
        description: "Internal medicine",
        doctors: 6,
        isEmergency: false
    },
    {
        id: "pediatrics",
        name: "Pediatrics",
        icon: Baby,
        capacity: 38,
        waitTime: 12,
        isRecommended: false,
        description: "Child healthcare",
        doctors: 4,
        isEmergency: false
    },
    {
        id: "ophthalmology",
        name: "Ophthalmology",
        icon: Eye,
        capacity: 25,
        waitTime: 18,
        isRecommended: false,
        description: "Eye care & surgery",
        doctors: 3,
        isEmergency: false
    },
    {
        id: "pulmonology",
        name: "Pulmonology",
        icon: Wind,
        capacity: 52,
        waitTime: 22,
        isRecommended: false,
        description: "Respiratory & lungs",
        doctors: 3,
        isEmergency: false
    }
]

function getCapacityColor(capacity: number): string {
    if (capacity >= 90) return "text-red-600 dark:text-red-400"
    if (capacity >= 70) return "text-orange-600 dark:text-orange-400"
    return "text-green-600 dark:text-green-400"
}

function getCapacityBgColor(capacity: number): string {
    if (capacity >= 90) return "bg-red-600 dark:bg-red-500"
    if (capacity >= 70) return "bg-orange-600 dark:bg-orange-500"
    return "bg-green-600 dark:bg-green-500"
}

interface DepartmentRecommendationsProps {
    recommendedDept?: string
}

export function DepartmentRecommendations({ recommendedDept }: DepartmentRecommendationsProps) {
    const departments = React.useMemo(() => {
        if (recommendedDept) {
            return DEPARTMENTS.map(dept => ({
                ...dept,
                isRecommended: dept.id === recommendedDept
            }))
        }
        return DEPARTMENTS
    }, [recommendedDept])

    const recommended = departments.find(d => d.isRecommended)

    return (
        <div className="h-full flex flex-col space-y-6 pt-4">
            {/* Recommended Department Highlight - simplified */}
            {recommended && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Recommendation
                    </h3>
                    <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-background border shadow-sm">
                                    <recommended.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-none">{recommended.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{recommended.description}</p>
                                </div>
                            </div>
                            <Button size="sm" className="h-8">
                                Transfer
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                        <div className="mt-4 flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Est. Wait: <span className="font-semibold">{recommended.waitTime} min</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span><span className="font-semibold">{recommended.doctors}</span> doctors</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Departments List - Table-like structure */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">All Departments</h4>
                <div className="space-y-1">
                    {departments.filter(d => !d.isRecommended).map((dept) => (
                        <div
                            key={dept.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <dept.icon className={cn("w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors", dept.isEmergency && "text-red-500")} />
                                <div className="min-w-0">
                                    <div className="font-medium text-sm truncate flex items-center gap-2">
                                        {dept.name}
                                        {dept.isEmergency && <Badge variant="destructive" className="h-4 px-1 text-[10px]">EMERGENCY</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className={getCapacityColor(dept.capacity)}>{dept.capacity}% Full</span>
                                        <span>•</span>
                                        <span>{dept.waitTime}m wait</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-24 hidden sm:block">
                                <Progress value={dept.capacity} className={cn("h-1.5", getCapacityBgColor(dept.capacity))} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
