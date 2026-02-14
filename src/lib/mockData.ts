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

export const mockPatients: Patient[] = [
    {
        id: "P-1024",
        name: "Sarah Johnson",
        age: 45,
        gender: "Female",
        riskLevel: "high",
        priorityScore: 92,
        waitingTime: 12,
        department: "Cardiology",
        confidence: 89
    },
    {
        id: "P-1025",
        name: "Michael Chen",
        age: 32,
        gender: "Male",
        riskLevel: "medium",
        priorityScore: 65,
        waitingTime: 24,
        department: "Emergency",
        confidence: 72
    },
    {
        id: "P-1026",
        name: "Emily Davis",
        age: 28,
        gender: "Female",
        riskLevel: "low",
        priorityScore: 35,
        waitingTime: 45,
        department: "General",
        confidence: 95
    },
    {
        id: "P-1027",
        name: "Robert Wilson",
        age: 68,
        gender: "Male",
        riskLevel: "high",
        priorityScore: 88,
        waitingTime: 8,
        department: "Respiratory",
        confidence: 91
    },
    {
        id: "P-1028",
        name: "Linda Taylor",
        age: 54,
        gender: "Female",
        riskLevel: "medium",
        priorityScore: 58,
        waitingTime: 30,
        department: "Orthopedics",
        confidence: 68
    },
    {
        id: "P-1029",
        name: "David Anderson",
        age: 41,
        gender: "Male",
        riskLevel: "low",
        priorityScore: 22,
        waitingTime: 55,
        department: "General",
        confidence: 98
    }
]
