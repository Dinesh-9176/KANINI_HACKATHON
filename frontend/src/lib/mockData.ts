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
    symptoms: string[]
    vitals: {
        hr: number
        bp: string
        spo2: number
        temp: number
    }
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
        confidence: 94,
        symptoms: ["Severe chest pain", "Shortness of breath", "Palpitations"],
        vitals: { hr: 110, bp: "150/95", spo2: 94, temp: 98.6 }
    },
    {
        id: "P-1025",
        name: "Michael Chen",
        age: 62,
        gender: "Male",
        riskLevel: "medium",
        priorityScore: 65,
        waitingTime: 25,
        department: "Neurology",
        confidence: 88,
        symptoms: ["Persistent migraine", "Dizziness", "Blurred vision"],
        vitals: { hr: 88, bp: "135/85", spo2: 97, temp: 98.4 }
    },
    {
        id: "P-1026",
        name: "Emily Davis",
        age: 28,
        gender: "Female",
        riskLevel: "low",
        priorityScore: 30,
        waitingTime: 45,
        department: "General Medicine",
        confidence: 91,
        symptoms: ["Fatigue", "Mild fever", "Body aches"],
        vitals: { hr: 78, bp: "120/80", spo2: 98, temp: 100.2 }
    },
    {
        id: "P-1027",
        name: "James Wilson",
        age: 35,
        gender: "Male",
        riskLevel: "high",
        priorityScore: 88,
        waitingTime: 5,
        department: "Trauma",
        confidence: 96,
        symptoms: ["Severe laceration", "Uncontrolled bleeding", "Shock"],
        vitals: { hr: 120, bp: "90/60", spo2: 92, temp: 97.5 }
    },
    {
        id: "P-1028",
        name: "Robert Brown",
        age: 58,
        gender: "Male",
        riskLevel: "medium",
        priorityScore: 55,
        waitingTime: 30,
        department: "Pulmonology",
        confidence: 85,
        symptoms: ["Chronic cough", "Wheezing", "Difficulty breathing"],
        vitals: { hr: 92, bp: "130/85", spo2: 90, temp: 98.6 }
    },
    {
        id: "P-1029",
        name: "Linda Martinez",
        age: 72,
        gender: "Female",
        riskLevel: "high",
        priorityScore: 95,
        waitingTime: 8,
        department: "Emergency / ICU",
        confidence: 93,
        symptoms: ["Unresponsiveness", "Shallow breathing", "Weak pulse"],
        vitals: { hr: 130, bp: "85/55", spo2: 88, temp: 96.8 }
    },
    {
        id: "P-1030",
        name: "David Kim",
        age: 41,
        gender: "Male",
        riskLevel: "low",
        priorityScore: 25,
        waitingTime: 50,
        department: "Orthopedics",
        confidence: 89,
        symptoms: ["Knee swelling", "Joint pain", "Difficulty walking"],
        vitals: { hr: 72, bp: "125/82", spo2: 99, temp: 98.6 }
    },
    {
        id: "P-1031",
        name: "Jennifer Lee",
        age: 29,
        gender: "Female",
        riskLevel: "medium",
        priorityScore: 48,
        waitingTime: 35,
        department: "OB-GYN",
        confidence: 90,
        symptoms: ["Abdominal cramping", "Spotting", "Nausea"],
        vitals: { hr: 85, bp: "118/76", spo2: 98, temp: 98.8 }
    },
    {
        id: "P-1032",
        name: "William Taylor",
        age: 50,
        gender: "Male",
        riskLevel: "high",
        priorityScore: 85,
        waitingTime: 15,
        department: "Gastroenterology",
        confidence: 87,
        symptoms: ["Severe abdominal pain", "Vomiting blood", "Dehydration"],
        vitals: { hr: 105, bp: "140/90", spo2: 96, temp: 99.1 }
    },
    {
        id: "P-1033",
        name: "Elizabeth White",
        age: 65,
        gender: "Female",
        riskLevel: "medium",
        priorityScore: 60,
        waitingTime: 40,
        department: "Endocrinology",
        confidence: 92,
        symptoms: ["High blood sugar", "Excessive thirst", "Confusion"],
        vitals: { hr: 90, bp: "135/85", spo2: 97, temp: 98.6 }
    },
    {
        id: "P-1034",
        name: "Thomas Harris",
        age: 33,
        gender: "Male",
        riskLevel: "low",
        priorityScore: 20,
        waitingTime: 60,
        department: "Dermatology",
        confidence: 86,
        symptoms: ["Severe rash", "Itching", "Skin lesion"],
        vitals: { hr: 70, bp: "120/80", spo2: 99, temp: 98.6 }
    },
    {
        id: "P-1035",
        name: "Susan Clark",
        age: 55,
        gender: "Female",
        riskLevel: "high",
        priorityScore: 90,
        waitingTime: 10,
        department: "Nephrology",
        confidence: 95,
        symptoms: ["Flank pain", "Decreased urine output", "Swelling"],
        vitals: { hr: 95, bp: "160/100", spo2: 95, temp: 98.6 }
    },
    {
        id: "P-1036",
        name: "George Lewis",
        age: 44,
        gender: "Male",
        riskLevel: "medium",
        priorityScore: 52,
        waitingTime: 28,
        department: "Urology",
        confidence: 84,
        symptoms: ["Painful urination", "Blood in urine", "Lower back pain"],
        vitals: { hr: 82, bp: "130/85", spo2: 98, temp: 99.0 }
    },
    {
        id: "P-1037",
        name: "Patricia Walker",
        age: 60,
        gender: "Female",
        riskLevel: "low",
        priorityScore: 35,
        waitingTime: 55,
        department: "Psychiatry",
        confidence: 91,
        symptoms: ["Anxiety", "Panic attacks", "Confusion"],
        vitals: { hr: 110, bp: "145/90", spo2: 98, temp: 98.6 }
    },
    {
        id: "P-1038",
        name: "Kevin Hall",
        age: 22,
        gender: "Male",
        riskLevel: "medium",
        priorityScore: 68,
        waitingTime: 22,
        department: "Infectious Disease",
        confidence: 88,
        symptoms: ["High fever", "Chills", "Productive cough"],
        vitals: { hr: 100, bp: "115/75", spo2: 93, temp: 102.5 }
    },
    {
        id: "P-1039",
        name: "Nancy Allen",
        age: 70,
        gender: "Female",
        riskLevel: "high",
        priorityScore: 89,
        waitingTime: 18,
        department: "Pediatrics / Geriatrics",
        confidence: 93,
        symptoms: ["Failure to thrive", "Weakness", "Confusion"],
        vitals: { hr: 60, bp: "100/60", spo2: 94, temp: 97.0 }
    },
    {
        id: "P-1040",
        name: "Steven Young",
        age: 38,
        gender: "Male",
        riskLevel: "low",
        priorityScore: 28,
        waitingTime: 48,
        department: "ENT",
        confidence: 90,
        symptoms: ["Ear pain", "Sore throat", "Congestion"],
        vitals: { hr: 75, bp: "120/80", spo2: 99, temp: 99.5 }
    },
    {
        id: "P-1041",
        name: "Karen King",
        age: 26,
        gender: "Female",
        riskLevel: "low",
        priorityScore: 15,
        waitingTime: 10,
        department: "Physiotherapy",
        confidence: 85,
        symptoms: ["Muscle strain", "Back pain", "Joint stiffness"],
        vitals: { hr: 70, bp: "118/78", spo2: 99, temp: 98.6 }
    }
]
