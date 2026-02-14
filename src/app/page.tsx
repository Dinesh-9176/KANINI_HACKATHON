"use client"

import * as React from "react"
import {
  Users,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/custom/ChartContainer"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts"

// Mock Data
const kpiData = [
  {
    title: "Total Patients Today",
    value: "142",
    trend: "+12%",
    trendUp: true,
    icon: Users,
    color: "text-blue-500"
  },
  {
    title: "High Risk Count",
    value: "28",
    trend: "+5%",
    trendUp: true,
    icon: Activity,
    color: "text-red-500"
  },
  {
    title: "Avg Waiting Time",
    value: "18m",
    trend: "-2m",
    trendUp: false, // good
    icon: Clock,
    color: "text-orange-500"
  },
  {
    title: "Department Load",
    value: "84%",
    trend: "+4%",
    trendUp: true,
    icon: TrendingUp,
    color: "text-pink-500"
  },
]

const riskData = [
  { name: 'High', value: 28, color: '#ef4444' }, // Red
  { name: 'Medium', value: 45, color: '#f97316' }, // Orange
  { name: 'Low', value: 69, color: '#22c55e' }, // Green
];

const deptData = [
  { name: 'General', patients: 45 },
  { name: 'Cardio', patients: 32 },
  { name: 'Neuro', patients: 18 },
  { name: 'Ortho', patients: 24 },
  { name: 'Peds', patients: 23 },
];

const hourlyData = [
  { time: '08:00', patients: 12 },
  { time: '10:00', patients: 28 },
  { time: '12:00', patients: 45 },
  { time: '14:00', patients: 35 },
  { time: '16:00', patients: 42 },
  { time: '18:00', patients: 25 },
];

const alerts = [
  { id: 1, message: "ER Capacity at 95%", type: "critical", time: "10m ago" },
  { id: 2, message: "Dr. Smith unavailable for Cardio", type: "warning", time: "25m ago" },
  { id: 3, message: "Ambulance arriving - 3 trauma cases", type: "critical", time: "2m ago" },
  { id: 4, message: "Pharmacy stock low on Epinephrine", type: "warning", time: "1h ago" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Overview</h2>
          <p className="text-muted-foreground">Hospital performance snapshot and live alerts.</p>
        </div>
        <Button>Download Report</Button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
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
                {" "}from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Risk Distribution - Pie */}
        <ChartContainer title="Risk Distribution" description="Current patient risk analysis" className="col-span-3">
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ChartContainer>

        {/* Department Load - Bar */}
        <ChartContainer title="Department Load" description="Patient count by department" className="col-span-4">
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="patients" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Bottom Row - Hourly & Alerts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Hourly Inflow - Line */}
        <ChartContainer title="Hourly Patient Inflow" description="Admission trends today" className="col-span-4">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} />
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

        {/* Critical Alerts Panel */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-3 rounded-lg border-l-4 bg-muted/30 hover:bg-muted/50 transition-colors ${alert.type === 'critical' ? 'border-l-red-500' : 'border-l-orange-500'
                    }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                  </div>
                  {alert.type === 'critical' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs h-8">View All Alerts</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
