"use client"

import * as React from "react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Cell
} from "recharts"
import { ChartContainer } from "@/components/custom/ChartContainer"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, TrendingUp, Clock, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const riskTrendData = [
    { day: 'Mon', high: 12, medium: 24, low: 45 },
    { day: 'Tue', high: 15, medium: 28, low: 40 },
    { day: 'Wed', high: 18, medium: 22, low: 48 },
    { day: 'Thu', high: 10, medium: 30, low: 52 },
    { day: 'Fri', high: 14, medium: 26, low: 45 },
    { day: 'Sat', high: 22, medium: 35, low: 30 },
    { day: 'Sun', high: 20, medium: 32, low: 35 },
];

const waitTimeData = [
    { range: '0-15m', patients: 45 },
    { range: '15-30m', patients: 32 },
    { range: '30-45m', patients: 18 },
    { range: '45-60m', patients: 12 },
    { range: '60m+', patients: 5 },
];

const deptPerformanceData = [
    { dept: 'Cardio', efficiency: 92, satisfaction: 4.5 },
    { dept: 'Neuro', efficiency: 88, satisfaction: 4.2 },
    { dept: 'Ortho', efficiency: 95, satisfaction: 4.8 },
    { dept: 'ER', efficiency: 85, satisfaction: 4.0 },
    { dept: 'General', efficiency: 90, satisfaction: 4.3 },
];

const aiPerformanceData = [
    { subject: 'Accuracy', A: 95, fullMark: 100 },
    { subject: 'Precision', A: 92, fullMark: 100 },
    { subject: 'Recall', A: 88, fullMark: 100 },
    { subject: 'F1 Score', A: 90, fullMark: 100 },
    { subject: 'Specificity', A: 94, fullMark: 100 },
    { subject: 'AUC', A: 96, fullMark: 100 },
];

const waitTimeColors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"]

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 h-full p-2">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-cyan-900">Hospital Analytics</h2>
                    <p className="text-slate-400 text-sm mt-1">Deep insights into patient flow, risk trends, and AI model performance.</p>
                </div>
            </div>

            {/* Top KPI Summary Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "AI Accuracy", value: "95%", icon: BrainCircuit, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
                    { label: "Avg Wait Time", value: "24m", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    { label: "Dept Efficiency", value: "90%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                    { label: "Weekly Patients", value: "982", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                ].map((kpi, index) => (
                    <div key={index} className="clay-card p-5 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                            <div className={cn("p-2 rounded-xl", kpi.bg)}>
                                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                            </div>
                        </div>
                        <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{kpi.value}</span>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">

                {/* 1️⃣ Risk Trends Over Time */}
                <ChartContainer title="Risk Trends Over Time" description="Weekly patient risk distribution">
                    <AreaChart data={riskTrendData}>
                        <defs>
                            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }} />
                        <Area type="monotone" dataKey="high" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" strokeWidth={2} />
                        <Area type="monotone" dataKey="medium" stroke="#f97316" fillOpacity={1} fill="url(#colorMedium)" strokeWidth={2} />
                        <Legend />
                    </AreaChart>
                </ChartContainer>

                {/* 2️⃣ Department Performance */}
                <ChartContainer title="Department Efficiency" description="Average treatment efficiency %">
                    <BarChart data={deptPerformanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis dataKey="dept" type="category" width={60} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }} />
                        <Bar dataKey="efficiency" fill="#0e7490" radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                </ChartContainer>

                {/* 3️⃣ Wait Time Distribution */}
                <ChartContainer title="Wait Time Distribution" description="Patient wait times (minutes)">
                    <BarChart data={waitTimeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(14, 116, 144, 0.05)' }}
                            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                        />
                        <Bar dataKey="patients" radius={[6, 6, 0, 0]}>
                            {waitTimeData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={waitTimeColors[index % waitTimeColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                {/* 4️⃣ AI Model Performance */}
                <div className="clay-card p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-cyan-600" />
                            AI Model Performance
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Model validation metrics (v2.4)</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                        <div className="h-[250px] w-full max-w-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aiPerformanceData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar name="Model A" dataKey="A" stroke="#0e7490" fill="#0e7490" fillOpacity={0.3} strokeWidth={2} />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 w-full md:w-auto">
                            <div className="grid grid-cols-2 gap-3 text-center">
                                {[
                                    { label: "Accuracy", value: "95%", highlight: true },
                                    { label: "Precision", value: "92%" },
                                    { label: "Recall", value: "88%" },
                                    { label: "AUC", value: "96%" },
                                ].map((metric, i) => (
                                    <div key={i} className={cn(
                                        "p-3 rounded-xl",
                                        metric.highlight ? "bg-cyan-50 dark:bg-cyan-900/20" : "bg-slate-50 dark:bg-slate-800/50"
                                    )}>
                                        <div className={cn(
                                            "text-2xl font-black tracking-tight",
                                            metric.highlight ? "text-cyan-700" : "text-slate-700 dark:text-slate-200"
                                        )}>
                                            {metric.value}
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{metric.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
