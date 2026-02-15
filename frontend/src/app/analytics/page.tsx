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
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer } from "@/components/custom/ChartContainer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, TrendingUp, Clock, Users, Activity, AlertTriangle, TrendingDown } from "lucide-react"

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

// Summary KPI Data
const kpiStats = [
    { title: "Total Patients Triaged", value: "1,247", trend: "+12%", trendUp: true, icon: Users, color: "text-blue-500" },
    { title: "Avg. Wait Time", value: "18m", trend: "-2m", trendUp: false, icon: Clock, color: "text-green-500" },
    { title: "High-Risk Cases", value: "156", trend: "+8%", trendUp: true, icon: AlertTriangle, color: "text-red-500" },
    { title: "AI Accuracy", value: "95%", trend: "+2%", trendUp: true, icon: Activity, color: "text-purple-500" },
]

// Risk Distribution for Donut Chart
const riskDistributionData = [
    { name: 'Low Risk', value: 580, color: '#22c55e' },
    { name: 'Medium Risk', value: 380, color: '#f97316' },
    { name: 'High Risk', value: 156, color: '#ef4444' },
];

// Hourly Triage Volume
const hourlyTriageData = [
    { hour: '6AM', patients: 12 },
    { hour: '8AM', patients: 28 },
    { hour: '10AM', patients: 45 },
    { hour: '12PM', patients: 62 },
    { hour: '2PM', patients: 55 },
    { hour: '4PM', patients: 48 },
    { hour: '6PM', patients: 42 },
    { hour: '8PM', patients: 25 },
    { hour: '10PM', patients: 15 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Hospital Analytics</h2>
                <p className="text-muted-foreground">Deep insights into patient flow, risk trends, and AI model performance.</p>
            </div>

            {/* KPI Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiStats.map((kpi, index) => (
                    <Card key={index} className="border-l-4 border-l-primary/50 hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.title}
                            </CardTitle>
                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className={kpi.trendUp ? "text-green-500" : "text-red-500"}>
                                    {kpi.trend}
                                </span>
                                {" "}from last week
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Donut Chart - Risk Level Distribution */}
                <ChartContainer title="Risk Level Distribution" description="Current patient risk analysis" className="col-span-3">
                    <PieChart>
                        <Pie
                            data={riskDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {riskDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ChartContainer>

                {/* Line Chart - Hourly Triage Volume */}
                <ChartContainer title="Triage Volume per Hour" description="Patient admissions by hour" className="col-span-4">
                    <LineChart data={hourlyTriageData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="patients"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </div>

            <Tabs defaultValue="operations" className="space-y-4">
                {/* Only implemented one tab for now as mock, but structure is there */}
                <div className="hidden">
                    {/* Mock TabsList if needed for sub-pages but user didn't request sub-tabs explicitly */}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">

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
                            <XAxis dataKey="day" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="high" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" />
                            <Area type="monotone" dataKey="medium" stroke="#f97316" fillOpacity={1} fill="url(#colorMedium)" />
                        </AreaChart>
                    </ChartContainer>

                    {/* 2️⃣ Department Performance */}
                    <ChartContainer title="Department Efficiency" description="Average treatment efficiency %">
                        <BarChart data={deptPerformanceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="dept" type="category" width={60} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="efficiency" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ChartContainer>

                    {/* 3️⃣ Wait Time Distribution */}
                    <ChartContainer title="Wait Time Distribution" description="Patient wait times (minutes)">
                        <BarChart data={waitTimeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="patients" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                {
                                    waitTimeData.map((entry, index) => (
                                        <FeatureCell key={`cell-${index}`} index={index} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ChartContainer>

                    {/* 4️⃣ AI Model Performance */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-primary" />
                                AI Model Performance
                            </CardTitle>
                            <CardDescription>Model validation metrics (v2.4)</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center">
                            <div className="h-[250px] w-full max-w-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aiPerformanceData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                        <Radar name="Model A" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4 w-full md:w-auto">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">95%</div>
                                        <div className="text-xs text-muted-foreground">Accuracy</div>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-lg">
                                        <div className="text-2xl font-bold">92%</div>
                                        <div className="text-xs text-muted-foreground">Precision</div>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-lg">
                                        <div className="text-2xl font-bold">88%</div>
                                        <div className="text-xs text-muted-foreground">Recall</div>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-lg">
                                        <div className="text-2xl font-bold">96%</div>
                                        <div className="text-xs text-muted-foreground">AUC</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </Tabs>
        </div>
    )
}
function FeatureCell({ index }: { index: number }) {
    const colors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"]
    return <rect fill={colors[index % colors.length]} />
}
