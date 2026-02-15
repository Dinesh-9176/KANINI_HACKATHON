"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, MoreHorizontal } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Reuse types/mock data logic
const patients = [
    { id: "P-1001", name: "John Doe", age: 45, dept: "Cardiology", risk: "high", priority: 92, status: "Waiting" },
    { id: "P-1002", name: "Jane Smith", age: 32, dept: "Emergency", risk: "medium", priority: 65, status: "Triage" },
    { id: "P-1003", name: "Robert Brown", age: 58, dept: "Neurology", risk: "low", priority: 30, status: "Admitted" },
    { id: "P-1004", name: "Alice Johnson", age: 24, dept: "General", risk: "low", priority: 15, status: "Discharged" },
    { id: "P-1005", name: "Michael Wilson", age: 67, dept: "Cardiology", risk: "high", priority: 88, status: "In Treatment" },
    { id: "P-1006", name: "Emily Davis", age: 41, dept: "Orthopedics", risk: "medium", priority: 55, status: "Waiting" },
]

export default function PatientsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
                <Button>+ Add Patient</Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Patient Directory</CardTitle>
                    {/* Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name, ID..." className="pl-8" />
                        </div>

                        <div className="flex gap-2">
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="cardio">Cardiology</SelectItem>
                                    <SelectItem value="ortho">Orthopedics</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Risk Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="high">High Risk</SelectItem>
                                    <SelectItem value="medium">Medium Risk</SelectItem>
                                    <SelectItem value="low">Low Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Risk Level</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((patient) => (
                                <TableRow key={patient.id} className="hover:border-primary/50 hover:bg-primary/5">
                                    <TableCell className="font-medium">{patient.id}</TableCell>
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.dept}</TableCell>
                                    <TableCell>
                                        <Badge variant={patient.risk as any}>{patient.risk.toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell>{patient.priority}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 text-gray-600 bg-gray-50">
                                            {patient.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Mockup */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
