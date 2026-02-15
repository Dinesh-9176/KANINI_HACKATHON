"use client"

import * as React from "react"
import { Mic, MicOff, Loader2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Supported languages with their codes
export const SUPPORTED_LANGUAGES = [
    // Indian Languages
    { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
    { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
    { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
    { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
    { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
    { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
    { code: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
    // World Languages
    { code: "en-US", name: "English (US)", nativeName: "English" },
    { code: "en-GB", name: "English (UK)", nativeName: "English" },
    { code: "es-ES", name: "Spanish", nativeName: "Español" },
    { code: "es-MX", name: "Spanish (Mexico)", nativeName: "Español" },
    { code: "fr-FR", name: "French", nativeName: "Français" },
    { code: "de-DE", name: "German", nativeName: "Deutsch" },
    { code: "it-IT", name: "Italian", nativeName: "Italiano" },
    { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português" },
    { code: "pt-PT", name: "Portuguese (Portugal)", nativeName: "Português" },
    { code: "ru-RU", name: "Russian", nativeName: "Русский" },
    { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "中文" },
    { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "中文" },
    { code: "ja-JP", name: "Japanese", nativeName: "日本語" },
    { code: "ko-KR", name: "Korean", nativeName: "한국어" },
    { code: "ar-SA", name: "Arabic", nativeName: "العربية" },
    { code: "tr-TR", name: "Turkish", nativeName: "Türkçe" },
    { code: "nl-NL", name: "Dutch", nativeName: "Nederlands" },
    { code: "pl-PL", name: "Polish", nativeName: "Polski" },
    { code: "vi-VN", name: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "th-TH", name: "Thai", nativeName: "ไทย" },
    { code: "id-ID", name: "Indonesian", nativeName: "Bahasa Indonesia" },
    { code: "ms-MY", name: "Malay", nativeName: "Bahasa Melayu" },
]

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
    start(): void
    stop(): void
    abort(): void
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

interface VoiceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: string) => void
    iconClassName?: string
    defaultLanguage?: string
}

export function VoiceInput({
    className,
    onValueChange,
    value,
    iconClassName,
    defaultLanguage = "en-US",
    ...props
}: VoiceInputProps) {
    const [isListening, setIsListening] = React.useState(false)
    const [isSupported, setIsSupported] = React.useState(true)
    const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedLanguage, setSelectedLanguage] = React.useState(defaultLanguage)

    React.useEffect(() => {
        // Check if Speech Recognition is supported
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            setIsSupported(false)
            return
        }

        const recognitionInstance = new SpeechRecognitionAPI()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = selectedLanguage

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join("")

            // Update the input value
            if (onValueChange) {
                onValueChange(transcript)
            }
        }

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error)
            setError(event.error)
            setIsListening(false)
        }

        recognitionInstance.onend = () => {
            setIsListening(false)
        }

        setRecognition(recognitionInstance)

        return () => {
            recognitionInstance.abort()
        }
    }, [])

    // Update language when selection changes
    React.useEffect(() => {
        if (recognition) {
            recognition.lang = selectedLanguage
        }
    }, [selectedLanguage, recognition])

    const toggleListening = React.useCallback(() => {
        if (!recognition) return

        setError(null)

        if (isListening) {
            recognition.stop()
        } else {
            try {
                recognition.lang = selectedLanguage
                recognition.start()
                setIsListening(true)
            } catch (err) {
                console.error("Failed to start speech recognition:", err)
            }
        }
    }, [recognition, isListening, selectedLanguage])

    const getLanguageDisplayName = (code: string) => {
        const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
        return lang ? `${lang.nativeName} (${lang.name})` : code
    }

    if (!isSupported) {
        return (
            <div className="flex items-center gap-2">
                <input
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    {...props}
                />
                <span className="text-xs text-muted-foreground" title="Voice input not supported in this browser">
                    <MicOff className="w-4 h-4" />
                </span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 relative">
            <input
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                    isListening && "border-red-500 ring-2 ring-red-500/20"
                )}
                value={value}
                onChange={(e) => onValueChange?.(e.target.value)}
                {...props}
            />

            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[130px] h-10 shrink-0" title="Select language">
                    <Globe className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Indian Languages
                    </div>
                    {SUPPORTED_LANGUAGES.filter(l => l.code.endsWith("-IN")).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.nativeName} - {lang.name}
                        </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">
                        World Languages
                    </div>
                    {SUPPORTED_LANGUAGES.filter(l => !l.code.endsWith("-IN")).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.nativeName} - {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Mic Button */}
            <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                className={cn(
                    "h-10 w-10 shrink-0 transition-all",
                    isListening && "animate-pulse",
                    iconClassName
                )}
                onClick={toggleListening}
                title={isListening ? "Stop listening" : `Start voice input (${getLanguageDisplayName(selectedLanguage)})`}
                disabled={props.disabled}
            >
                {isListening ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </Button>
            {error && (
                <span className="absolute -bottom-5 left-0 text-xs text-red-500">
                    {error}
                </span>
            )}
        </div>
    )
}
