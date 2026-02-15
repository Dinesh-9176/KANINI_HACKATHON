"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceInputProps {
    onTranscription: (text: string) => void
    isProcessing?: boolean
}

export function VoiceInput({ onTranscription, isProcessing = false }: VoiceInputProps) {
    const [isRecording, setIsRecording] = React.useState(false)
    const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = React.useState<Blob[]>([])
    const [error, setError] = React.useState<string | null>(null)
    const [uploading, setUploading] = React.useState(false)

    // Helper to fetch transcription
    const sendAudio = async (blob: Blob) => {
        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", blob, "recording.webm")

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const res = await fetch(`${API_URL}/api/voice/process`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Voice processing failed")

            const data = await res.json()
            if (data.text) {
                onTranscription(data.text)
            }
        } catch (err) {
            console.error("Voice API Error:", err)
            setError("Could not process voice. Try typing.")
        } finally {
            setUploading(false)
        }
    }

    const startRecording = async () => {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data)
            }

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/webm" })
                setAudioChunks([])
                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop())

                // Process audio
                sendAudio(audioBlob)
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        } catch (err) {
            console.error("Mic Error:", err)
            setError("Microphone access denied.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop()
            setIsRecording(false)
            setMediaRecorder(null)
        }
    }

    const isLoading = uploading || isProcessing

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                type="button"
                variant={isRecording ? "destructive" : "secondary"}
                size="lg"
                className={cn(
                    "rounded-full w-16 h-16 shadow-lg transition-all duration-300 relative overflow-hidden",
                    isRecording && "animate-pulse ring-4 ring-red-500/30 scale-110",
                    !isRecording && "hover:bg-cyan-100 dark:hover:bg-cyan-900/30 border-2 border-dashed border-cyan-300 dark:border-cyan-700"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                ) : isRecording ? (
                    <Square className="w-6 h-6 fill-current" />
                ) : (
                    <Mic className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                )}

                {/* Ripple effect when waiting */}
                {!isRecording && !isLoading && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/10" />
                )}
            </Button>

            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 min-h-[1.5em]">
                {isLoading ? (
                    <span className="flex items-center gap-1.5 text-cyan-600 animate-pulse">
                        <Sparkles className="w-3 h-3" /> Processing Audio...
                    </span>
                ) : isRecording ? (
                    <span className="text-red-500 animate-pulse">Recording... Tap to Stop</span>
                ) : error ? (
                    <span className="text-red-500">{error}</span>
                ) : (
                    "Tap to Speak"
                )}
            </div>
        </div>
    )
}
