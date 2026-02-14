"use client"

import * as React from "react"
import { Search, Filter, SortAsc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PatientCard, type Patient } from "@/components/custom/PatientCard"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface PatientQueueProps {
    patients: Patient[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export function PatientQueue({ patients, selectedId, onSelect }: PatientQueueProps) {
    return (
        <div className="flex flex-col h-full border-r bg-background/50">
            {/* Header / Filters */}
            <div className="p-4 space-y-3 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search name or ID..." className="pl-8" />
                </div>
                <div className="flex gap-2">
                    <Select>
                        <SelectTrigger className="flex-1">
                            <Filter className="mr-2 h-3 w-3" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="cardio">Cardiology</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                        <SortAsc className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {patients.map((patient) => (
                    <PatientCard
                        key={patient.id}
                        patient={patient}
                        isActive={selectedId === patient.id}
                        onClick={() => onSelect(patient.id)}
                    />
                ))}
            </div>
        </div>
    )
}
