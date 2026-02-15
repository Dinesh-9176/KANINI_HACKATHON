"use client"

import React, { useEffect, useRef } from 'react'

interface ECGMonitorProps {
    className?: string
    color?: string
    bpm?: number
}

export function ECGMonitor({ className, color = "#10b981", bpm = 80 }: ECGMonitorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const bpmRef = useRef(bpm)

    // Keep the ref in sync with the prop without restarting the animation
    useEffect(() => {
        bpmRef.current = bpm
    }, [bpm])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let width = canvas.width
        let height = canvas.height

        // Configuration
        const speed = 2 // pixels per frame
        const data: number[] = []

        // PQRST Wave Definition (normalized magnitude, ~100 frames total duration at 60fps)
        // 0 = baseline, -1 = top, 1 = bottom
        const waveShape = [
            0, 0, 0, 0, 0, 0, 0, 0, // Flat
            -0.1, -0.15, -0.1, 0, // P (tiny bump up)
            0, 0, 0, // PR segment
            0.1, // Q (tiny dip)
            -0.8, -1.0, -0.4, // R (huge spike up)
            0.3, 0.1, // S (dip down)
            0, 0, 0, 0, // ST segment
            -0.2, -0.25, -0.3, -0.25, -0.1, // T (medium bump)
            0, 0, 0, 0 // Flat
        ]

        let x = 0
        let frameCount = 0
        let beatTimer = 0
        let currentWaveIndex = -1

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth
                canvas.height = canvas.parentElement.clientHeight
                width = canvas.width
                height = canvas.height
                // Only reset data if dimensions change drastically? 
                // To be safe and simple, we reset on resize.
                data.length = Math.ceil(width / speed)
                // Fill with baseline to prevent flash
                for (let i = 0; i < data.length; i++) data[i] = height / 2;
                x = 0
            }
        }

        window.addEventListener('resize', resize)
        resize()

        const render = () => {
            const centerY = height / 2
            const scale = height * 0.4

            // --- 1. Calculate Next Y Value ---

            // Beat logic using the LIVE ref value
            const currentBpm = bpmRef.current
            // 60fps / (bpm / 60) = frames per beat
            const framesPerBeat = (60 * 60) / (currentBpm || 60)

            if (beatTimer > framesPerBeat) {
                beatTimer = 0
                currentWaveIndex = 0 // Start a new wave cycle
            }
            beatTimer++

            let yOffset = 0
            if (currentWaveIndex >= 0 && currentWaveIndex < waveShape.length) {
                yOffset = waveShape[currentWaveIndex] * scale
                currentWaveIndex++
            } else {
                yOffset = (Math.random() - 0.5) * 4 // Baseline noise
                currentWaveIndex = -1
            }

            // --- 2. Update Data Buffer ---
            const dataIndex = Math.floor(x / speed)
            if (dataIndex < data.length) {
                data[dataIndex] = centerY + yOffset
            }

            // --- 3. Draw Frame ---
            ctx.clearRect(0, 0, width, height)

            ctx.lineWidth = 2
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'
            ctx.shadowBlur = 4
            ctx.shadowColor = color
            ctx.strokeStyle = color

            ctx.beginPath()

            // Draw standard line
            for (let i = 0; i < data.length - 1; i++) {
                const px = i * speed

                // Gap creates the "wiper" effect
                if (Math.abs(px - x) < 30) continue;

                if (i === 0) {
                    ctx.moveTo(px, data[i])
                } else {
                    // Check gap again to avoid cross-drawing
                    if (Math.abs((i - 1) * speed - x) < 30) {
                        ctx.moveTo(px, data[i])
                    } else {
                        ctx.lineTo(px, data[i])
                    }
                }
            }
            ctx.stroke()

            // Leading Dot
            ctx.fillStyle = '#ffffff'
            ctx.shadowBlur = 10
            ctx.shadowColor = '#ffffff'
            ctx.beginPath()
            // Ensure dataIndex is safe
            const safeY = data[dataIndex] === undefined ? centerY : data[dataIndex];
            ctx.arc(x, safeY, 2, 0, Math.PI * 2)
            ctx.fill()

            // --- 4. Increment ---
            x += speed
            if (x >= width) {
                x = 0
            }

            frameCount++
            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [color]) // Removed bpm from dependency to avoid reset

    return <canvas ref={canvasRef} className={className} />
}
