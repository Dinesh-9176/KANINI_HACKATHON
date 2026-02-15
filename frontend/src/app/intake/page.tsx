"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Upload,
    FileText,
    X,
    User,
    Heart,
    Thermometer,
    Activity,
    Wind,
    Stethoscope,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Sparkles,
    Mic,
    Globe,
    Watch
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceInput } from "@/components/ui/voice-input"
import { useTranslation } from "@/lib/language-context"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useBluetoothDevice } from "@/hooks/useBluetoothDevice"
import { WearableSimulator } from "@/components/triage/WearableSimulator"

// Common symptoms for multi-select
const COMMON_SYMPTOMS = [
    "Chest Pain", "Shortness of Breath", "Fever", "Cough", "Headache",
    "Dizziness", "Nausea", "Abdominal Pain", "Back Pain", "Joint Pain",
    "Fatigue", "Weight Loss", "Vision Problems", "Numbness", "Seizures",
    "Bleeding", "Swelling", "Skin Rash", "Difficulty Swallowing", "Anxiety"
]

// Pre-existing conditions
const CONDITIONS = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma", "COPD",
    "Cancer", "Kidney Disease", "Liver Disease", "Stroke History",
    "Arthritis", "Thyroid Disorder", "Depression/Anxiety", "None"
]

interface FormData {
    // Demographics
    age: string
    gender: string
    name: string

    // Vitals
    bloodPressureSystolic: string
    bloodPressureDiastolic: string
    heartRate: string
    temperature: string
    oxygenSaturation: string
    respiratoryRate: string

    // Clinical
    symptoms: string[]
    conditions: string[]

    // Additional
    notes: string
}

export default function PatientIntakePage() {
    const router = useRouter()
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    // Voice input state for notes
    const [notesLanguage, setNotesLanguage] = React.useState("en-US")
    const [isNotesListening, setIsNotesListening] = React.useState(false)
    const [notesRecognition, setNotesRecognition] = React.useState<any>(null)

    const [formData, setFormData] = React.useState<FormData>({
        age: "",
        gender: "",
        name: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
        symptoms: [],
        conditions: [],
        notes: ""
    })

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const toggleSymptom = (symptom: string) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }))
    }

    const toggleCondition = (condition: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter(c => c !== condition)
                : [...prev.conditions, condition]
        }))
    }

    const [ehrParsedData, setEhrParsedData] = React.useState<any>(null)
    const [ehrParsing, setEhrParsing] = React.useState(false)
    const [ehrError, setEhrError] = React.useState<string | null>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            const name = file.name.toLowerCase()
            if (name.endsWith(".docx") || name.endsWith(".doc")) {
                setUploadedFile(file)
                parseEhrFile(file)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setUploadedFile(file)
            parseEhrFile(file)
        }
    }

    const parseEhrFile = async (file: File) => {
        setEhrParsing(true)
        setEhrError(null)
        setEhrParsedData(null)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const fd = new FormData()
            fd.append("file", file)
            const res = await fetch(`${API_URL}/api/parse-ehr`, {
                method: "POST",
                body: fd,
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || "Failed to parse EHR document")
            }
            const data = await res.json()
            setEhrParsedData(data)
            // Pre-fill form fields from parsed EHR data
            if (data.name) updateField("name", data.name)
            if (data.age) updateField("age", String(data.age))
            if (data.gender) updateField("gender", data.gender)
            if (data.blood_pressure_systolic) updateField("bloodPressureSystolic", String(data.blood_pressure_systolic))
            if (data.blood_pressure_diastolic) updateField("bloodPressureDiastolic", String(data.blood_pressure_diastolic))
            if (data.heart_rate) updateField("heartRate", String(data.heart_rate))
            if (data.temperature) updateField("temperature", String(data.temperature))
            if (data.oxygen_saturation) updateField("oxygenSaturation", String(data.oxygen_saturation))
            if (data.respiratory_rate) updateField("respiratoryRate", String(data.respiratory_rate))
            if (data.notes) updateField("notes", data.notes)
        } catch (err: any) {
            setEhrError(err.message || "Failed to parse EHR")
        } finally {
            setEhrParsing(false)
        }
    }

    const removeFile = () => {
        setUploadedFile(null)
    }

    const calculateProgress = () => {
        let filled = 0
        const total = 12 // Number of required fields

        if (formData.name) filled++
        if (formData.age) filled++
        if (formData.gender) filled++
        if (formData.bloodPressureSystolic) filled++
        if (formData.bloodPressureDiastolic) filled++
        if (formData.heartRate) filled++
        if (formData.temperature) filled++
        if (formData.oxygenSaturation) filled++
        if (formData.symptoms.length > 0) filled++
        if (formData.conditions.length > 0) filled++
        if (formData.respiratoryRate) filled++

        return Math.round((filled / total) * 100)
    }

    React.useEffect(() => {
        setProgress(calculateProgress())
    }, [formData])

    const {
        connect: connectBluetooth,
        isConnected: isBluetoothConnected,
        isConnecting: isBluetoothConnecting,
        error: bluetoothError,
        deviceData
    } = useBluetoothDevice()

    React.useEffect(() => {
        if (deviceData.heartRate) {
            updateField("heartRate", deviceData.heartRate.toString())
        }
    }, [deviceData.heartRate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Build the request payload
            // If EHR was parsed, merge its symptoms/conditions with any manual selections
            const ehrSymptoms = ehrParsedData?.symptoms || []
            const allSymptoms = [...new Set([...formData.symptoms, ...ehrSymptoms])]
            const ehrConditions = ehrParsedData?.conditions || []
            const allConditions = [...new Set([...formData.conditions, ...ehrConditions])]

            const payload = {
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender,
                blood_pressure_systolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
                blood_pressure_diastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
                heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
                temperature: formData.temperature ? parseFloat(formData.temperature) : null,
                oxygen_saturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
                respiratory_rate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
                symptoms: allSymptoms,
                conditions: allConditions,
                notes: formData.notes,
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const res = await fetch(`${API_URL}/api/triage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || "Triage analysis failed")
            }

            const triageResult = await res.json()

            // Store the result for the triage page to read
            localStorage.setItem("triageResult", JSON.stringify({
                ...triageResult,
                symptoms: allSymptoms,
            }))

            // Navigate to triage page
            router.push("/triage?source=intake")
        } catch (err: any) {
            alert(`Error: ${err.message || "Failed to run triage analysis. Is the backend running?"}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFormValid = () => {
        return formData.name &&
            formData.age &&
            formData.gender &&
            (formData.symptoms.length > 0 || uploadedFile)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("intake_title")}</h2>
                    <p className="text-muted-foreground">{t("intake_subtitle")}</p>
                </div>
                <div className="flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
                    <Sparkles className="w-4 h-4 mr-2 text-primary fill-primary/20" />
                    <span className="text-sm font-semibold text-primary">AI Enabled Assist</span>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t("intake_form_completion")}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            <Tabs defaultValue="manual" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t("intake_manual_entry")}
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {t("intake_upload_ehr")}
                    </TabsTrigger>
                </TabsList>

                {/* Manual Entry Tab */}
                <TabsContent value="manual" className="space-y-6">
                    <form onSubmit={handleSubmit}>
                        {/* Demographics */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    {t("intake_demographics")}
                                </CardTitle>
                                <CardDescription>{t("intake_basic_info")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("intake_name")} * <span className="text-xs text-muted-foreground">(Voice input enabled)</span></Label>
                                        <VoiceInput
                                            id="name"
                                            value={formData.name}
                                            onValueChange={(value) => updateField("name", value)}
                                            placeholder="Enter or speak patient name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age">{t("intake_age")} *</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => updateField("age", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">{t("intake_gender")} *</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => updateField("gender", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">{t("intake_gender_male")}</SelectItem>
                                                <SelectItem value="female">{t("intake_gender_female")}</SelectItem>
                                                <SelectItem value="other">{t("intake_gender_other")}</SelectItem>
                                                <SelectItem value="prefer-not">{t("intake_gender_prefer_not")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vitals */}
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-red-500" />
                                        {t("intake_vitals")}
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={connectBluetooth}
                                        disabled={isBluetoothConnecting}
                                        className={cn(isBluetoothConnected && "bg-green-100 text-green-700 border-green-200")}
                                    >
                                        {isBluetoothConnecting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : isBluetoothConnected ? (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        ) : (
                                            <div className="mr-2">⚡</div>
                                        )}
                                        {isBluetoothConnected ? "Device Connected" : "Connect Wearable"}
                                    </Button>
                                </div>
                                <CardDescription>{t("intake_vitals_desc")}</CardDescription>
                                {bluetoothError && (
                                    <p className="text-sm text-red-500 mt-2">{bluetoothError}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bp-systolic">{t("intake_bp_systolic")} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="bp-systolic"
                                                type="number"
                                                value={formData.bloodPressureSystolic}
                                                onChange={(e) => updateField("bloodPressureSystolic", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">mmHg</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bp-diastolic">{t("intake_bp_diastolic")} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="bp-diastolic"
                                                type="number"
                                                value={formData.bloodPressureDiastolic}
                                                onChange={(e) => updateField("bloodPressureDiastolic", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">mmHg</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="heart-rate">{t("intake_heart_rate")} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="heart-rate"
                                                type="number"
                                                value={formData.heartRate}
                                                onChange={(e) => updateField("heartRate", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">bpm</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="temperature">{t("intake_temperature")} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="temperature"
                                                type="number"
                                                step="0.1"
                                                value={formData.temperature}
                                                onChange={(e) => updateField("temperature", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">°F</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="oxygen">{t("intake_oxygen")} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="oxygen"
                                                type="number"
                                                value={formData.oxygenSaturation}
                                                onChange={(e) => updateField("oxygenSaturation", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="respiratory">{t("intake_respiratory")}</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="respiratory"
                                                type="number"
                                                value={formData.respiratoryRate}
                                                onChange={(e) => updateField("respiratoryRate", e.target.value)}
                                            />
                                            <span className="text-muted-foreground">/min</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Symptoms */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-orange-500" />
                                    {t("intake_symptoms")} *
                                </CardTitle>
                                <CardDescription>{t("intake_symptoms_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_SYMPTOMS.map((symptom) => (
                                        <Button
                                            key={symptom}
                                            type="button"
                                            variant={formData.symptoms.includes(symptom) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleSymptom(symptom)}
                                            className={cn(
                                                "transition-all",
                                                formData.symptoms.includes(symptom) && "ring-2 ring-primary/50"
                                            )}
                                        >
                                            {symptom}
                                            {formData.symptoms.includes(symptom) && (
                                                <CheckCircle2 className="w-3 h-3 ml-1" />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                                {formData.symptoms.length === 0 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        <AlertCircle className="w-4 h-4 inline mr-1" />
                                        {t("msg_select_symptom")}
                                    </p>
                                )}
                            </CardContent>
                        </Card>



                        {/* Pre-existing Conditions */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t("intake_conditions")}</CardTitle>
                                <CardDescription>{t("intake_conditions_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {CONDITIONS.map((condition) => (
                                        <Button
                                            key={condition}
                                            type="button"
                                            variant={formData.conditions.includes(condition) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleCondition(condition)}
                                        >
                                            {condition}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t("intake_notes")}</CardTitle>
                                <CardDescription>{t("intake_notes_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <textarea
                                        id="notes"
                                        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                                        value={formData.notes}
                                        onChange={(e) => updateField("notes", e.target.value)}
                                        placeholder="Enter notes or click the microphone to speak..."
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <Select
                                            value={notesLanguage}
                                            onValueChange={(value) => setNotesLanguage(value)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <Globe className="w-3 h-3 mr-1" />
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    Indian Languages
                                                </div>
                                                <SelectItem value="ta-IN">Tamil - தமிழ்</SelectItem>
                                                <SelectItem value="te-IN">Telugu - తెలుగు</SelectItem>
                                                <SelectItem value="hi-IN">Hindi - हिन्दी</SelectItem>
                                                <SelectItem value="kn-IN">Kannada - ಕನ್ನಡ</SelectItem>
                                                <SelectItem value="ml-IN">Malayalam - മലയാളം</SelectItem>
                                                <SelectItem value="bn-IN">Bengali - বাংলা</SelectItem>
                                                <SelectItem value="gu-IN">Gujarati - ગુજરાતી</SelectItem>
                                                <SelectItem value="mr-IN">Marathi - मराठी</SelectItem>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">
                                                    World Languages
                                                </div>
                                                <SelectItem value="en-US">English (US)</SelectItem>
                                                <SelectItem value="en-GB">English (UK)</SelectItem>
                                                <SelectItem value="es-ES">Spanish - Español</SelectItem>
                                                <SelectItem value="fr-FR">French - Français</SelectItem>
                                                <SelectItem value="de-DE">German - Deutsch</SelectItem>
                                                <SelectItem value="zh-CN">Chinese - 中文</SelectItem>
                                                <SelectItem value="ja-JP">Japanese - 日本語</SelectItem>
                                                <SelectItem value="ar-SA">Arabic - العربية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={isNotesListening ? "destructive" : "outline"}
                                            onClick={() => {
                                                const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
                                                if (!SpeechRecognitionAPI) {
                                                    alert("Voice input not supported in this browser")
                                                    return
                                                }

                                                if (isNotesListening) {
                                                    notesRecognition?.stop()
                                                    setIsNotesListening(false)
                                                    return
                                                }

                                                const recognition = new SpeechRecognitionAPI()
                                                recognition.continuous = true
                                                recognition.interimResults = true
                                                recognition.lang = notesLanguage

                                                recognition.onresult = (event: any) => {
                                                    const transcript = Array.from(event.results)
                                                        .map((result: any) => result[0].transcript)
                                                        .join("")
                                                    updateField("notes", formData.notes + " " + transcript)
                                                }
                                                recognition.onend = () => setIsNotesListening(false)

                                                recognition.start()
                                                setNotesRecognition(recognition)
                                                setIsNotesListening(true)
                                            }}
                                        >
                                            {isNotesListening ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Stop
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className="w-4 h-4 mr-1" /> Voice
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={!isFormValid() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {t("intake_running_analysis")}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    {t("intake_run_analysis")}
                                </>
                            )}
                        </Button>
                    </form>
                </TabsContent>

                {/* EHR Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("intake_upload_pdf")}</CardTitle>
                            <CardDescription>{t("intake_upload_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
                                    isDragging
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                                    uploadedFile && !ehrError && "border-green-500 bg-green-500/5",
                                    ehrError && "border-red-500 bg-red-500/5"
                                )}
                            >
                                <input
                                    type="file"
                                    accept=".docx,.doc"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                {ehrParsing ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                        <p className="text-lg font-medium">Parsing EHR document...</p>
                                        <p className="text-sm text-muted-foreground">Extracting patient data</p>
                                    </div>
                                ) : uploadedFile ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <FileText className={cn("w-12 h-12", ehrError ? "text-red-500" : "text-green-500")} />
                                        <div className="text-left">
                                            <p className={cn("font-medium", ehrError ? "text-red-600" : "text-green-600")}>{uploadedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(uploadedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                            {ehrError && (
                                                <p className="text-sm text-red-500 mt-1">{ehrError}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { removeFile(); setEhrParsedData(null); setEhrError(null) }}
                                            className="ml-4"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-lg font-medium">Upload EHR/EMR Document or click to browse</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {t("intake_supports_pdf")}
                                        </p>
                                    </label >
                                )
                                }
                            </div >

                            {/* Parsed EHR Data Preview */}
                            {ehrParsedData && (
                                <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Extracted Patient Data
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {ehrParsedData.age > 0 && (
                                                <div><span className="text-muted-foreground">Age:</span> <strong>{ehrParsedData.age}</strong></div>
                                            )}
                                            {ehrParsedData.gender && (
                                                <div><span className="text-muted-foreground">Gender:</span> <strong className="capitalize">{ehrParsedData.gender}</strong></div>
                                            )}
                                            {ehrParsedData.heart_rate && (
                                                <div><span className="text-muted-foreground">HR:</span> <strong>{ehrParsedData.heart_rate} bpm</strong></div>
                                            )}
                                            {ehrParsedData.blood_pressure_systolic && (
                                                <div><span className="text-muted-foreground">BP:</span> <strong>{ehrParsedData.blood_pressure_systolic}/{ehrParsedData.blood_pressure_diastolic} mmHg</strong></div>
                                            )}
                                            {ehrParsedData.temperature && (
                                                <div><span className="text-muted-foreground">Temp:</span> <strong>{ehrParsedData.temperature}°F</strong></div>
                                            )}
                                            {ehrParsedData.oxygen_saturation && (
                                                <div><span className="text-muted-foreground">SpO2:</span> <strong>{ehrParsedData.oxygen_saturation}%</strong></div>
                                            )}
                                            {ehrParsedData.respiratory_rate && (
                                                <div><span className="text-muted-foreground">RR:</span> <strong>{ehrParsedData.respiratory_rate}/min</strong></div>
                                            )}
                                        </div>
                                        {ehrParsedData.symptoms?.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Symptoms:</span>{" "}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {ehrParsedData.symptoms.map((s: string) => (
                                                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {ehrParsedData.conditions?.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Conditions:</span>{" "}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {ehrParsedData.conditions.map((c: string) => (
                                                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {ehrParsedData.notes && (
                                            <div>
                                                <span className="text-muted-foreground">Notes:</span>{" "}
                                                <em>"{ehrParsedData.notes}"</em>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Override fields (shown when EHR is parsed) */}
                            {ehrParsedData && (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        You can override extracted values below
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
                                        <Input
                                            placeholder="Patient Name"
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={(e) => updateField("age", e.target.value)}
                                        />
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => updateField("gender", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Manual Entry Prompt (fallback when no EHR is parsed) */}
                            {!ehrParsedData && (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {t("intake_complement_doc")}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
                                        <Input
                                            placeholder="Patient Name"
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={(e) => updateField("age", e.target.value)}
                                        />
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => updateField("gender", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                size="lg"
                                className="w-full"
                                disabled={!ehrParsedData || !formData.name || !formData.age || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t("intake_processing")}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Run AI Triage Analysis
                                    </>
                                )}
                            </Button >
                        </CardContent >
                    </Card >
                </TabsContent >
            </Tabs >
        </div >
    )
}
