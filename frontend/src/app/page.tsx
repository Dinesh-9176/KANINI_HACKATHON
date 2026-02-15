"use client"

import * as React from "react"
import {
  Users,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/custom/ChartContainer"
import {
  PieChart,
  Pie,
  Cell,
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
import { cn } from "@/lib/utils"

// Mock Data
const kpiData = [
  {
    title: "Total Patients Today",
    value: "142",
    trend: "+12%",
    trendUp: true,
    icon: Users,
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20"
  },
  {
    title: "High Risk Count",
    value: "28",
    trend: "+5%",
    trendUp: true,
    icon: Activity,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/20"
  },
  {
    title: "Avg Waiting Time",
    value: "18m",
    trend: "-2m",
    trendUp: false,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    title: "Department Load",
    value: "84%",
    trend: "+4%",
    trendUp: true,
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  },
]

const riskData = [
  { name: 'High', value: 28, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#f97316' },
  { name: 'Low', value: 69, color: '#22c55e' },
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
  const handleDownloadReport = () => {
    const now = new Date()
    const reportDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const reportTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Hospital Dashboard Report - ${reportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 3px solid #0e7490; padding-bottom: 20px; margin-bottom: 28px; }
    .header h1 { font-size: 28px; color: #0e7490; }
    .header .sub { font-size: 12px; color: #64748b; letter-spacing: 0.05em; }
    .header .date { float: right; text-align: right; font-size: 11px; color: #94a3b8; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px; }
    .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 700; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #0c4a6e; margin-top: 4px; }
    .kpi-trend { font-size: 12px; margin-top: 4px; }
    .trend-up { color: #16a34a; }
    .trend-down { color: #dc2626; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; }
    .bar-bg { width: 120px; height: 8px; background: #e2e8f0; border-radius: 4px; display: inline-block; vertical-align: middle; margin-left: 8px; }
    .bar-fill { height: 100%; border-radius: 4px; background: #0e7490; }
    .alert { padding: 10px 14px; border-left: 4px solid; border-radius: 6px; margin-bottom: 8px; background: #f8fafc; }
    .alert-critical { border-color: #ef4444; }
    .alert-warning { border-color: #f97316; }
    .alert-msg { font-size: 13px; font-weight: 600; color: #1e293b; }
    .alert-time { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .risk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .risk-item { text-align: center; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; }
    .risk-value { font-size: 24px; font-weight: 800; }
    .risk-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 600; margin-top: 4px; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="date">Generated<br><strong>${reportDate} at ${reportTime}</strong></div>
    <h1>\u{1F3E5} Hospital Dashboard Report</h1>
    <div class="sub">Hospital System — Daily Performance Summary</div>
  </div>

  <div class="kpi-grid">
    ${kpiData.map(k => `
      <div class="kpi">
        <div class="kpi-label">${k.title}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-trend ${k.trendUp ? 'trend-up' : 'trend-down'}">${k.trend} from yesterday</div>
      </div>
    `).join('')}
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-title">Risk Distribution</div>
      <div class="risk-grid">
        ${riskData.map(r => `
          <div class="risk-item">
            <div class="risk-value" style="color: ${r.color}">${r.value}</div>
            <div class="risk-label">${r.name} Risk</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Department Load</div>
      <table>
        <thead><tr><th>Department</th><th>Patients</th><th>Load</th></tr></thead>
        <tbody>
          ${deptData.map(d => `
            <tr>
              <td style="font-weight: 600;">${d.name}</td>
              <td>${d.patients}</td>
              <td>
                <div class="bar-bg"><div class="bar-fill" style="width: ${Math.round(d.patients / 50 * 100)}%"></div></div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Hourly Patient Inflow</div>
    <table>
      <thead><tr><th>Time</th><th>Patients</th><th>Volume</th></tr></thead>
      <tbody>
        ${hourlyData.map(h => `
          <tr>
            <td style="font-weight: 600;">${h.time}</td>
            <td>${h.patients}</td>
            <td>
              <div class="bar-bg"><div class="bar-fill" style="width: ${Math.round(h.patients / 50 * 100)}%"></div></div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Active Alerts</div>
    ${alerts.map(a => `
      <div class="alert alert-${a.type}">
        <div class="alert-msg">${a.message}</div>
        <div class="alert-time">${a.time} · ${a.type.toUpperCase()}</div>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>This report was generated by the Hospital System dashboard. Data reflects real-time metrics at time of generation.</p>
    <p style="margin-top: 4px;">\u00A9 ${now.getFullYear()} Hospital System · Confidential</p>
  </div>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  return (
    <div className="space-y-6 h-full p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-cyan-900">Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Hospital performance snapshot and live alerts.</p>
        </div>
        <Button
          onClick={handleDownloadReport}
          className="clay-button bg-cyan-700 hover:bg-cyan-600 text-white border-0 h-10 px-6 rounded-xl font-bold tracking-wide shadow-cyan-900/20"
        >
          Download Report
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="clay-card p-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
              <div className={cn("p-2 rounded-xl", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{kpi.value}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold border-0",
                  kpi.trendUp
                    ? kpi.title === "Avg Waiting Time"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-emerald-50 text-emerald-600"
                    : kpi.title === "Avg Waiting Time"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                )}
              >
                {kpi.trend}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">from yesterday</p>
          </div>
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
            <Tooltip
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ChartContainer>

        {/* Department Load - Bar */}
        <ChartContainer title="Department Load" description="Patient count by department" className="col-span-4">
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              cursor={{ fill: 'rgba(14, 116, 144, 0.05)' }}
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
            />
            <Bar dataKey="patients" fill="#0e7490" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Bottom Row - Hourly & Alerts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Hourly Inflow - Line */}
        <ChartContainer title="Hourly Patient Inflow" description="Admission trends today" className="col-span-4">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
            />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#0e7490"
              strokeWidth={3}
              dot={{ r: 4, fill: "#fff", stroke: "#0e7490", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#0e7490" }}
            />
          </LineChart>
        </ChartContainer>

        {/* Critical Alerts Panel */}
        <div className="clay-card col-span-3 p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
              Critical Alerts
            </h3>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border-l-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  alert.type === 'critical' ? 'border-l-rose-500' : 'border-l-amber-500'
                )}
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
                    {alert.message}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {alert.time}
                  </p>
                </div>
                {alert.type === 'critical' && (
                  <span className="relative flex h-2 w-2 mt-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs h-8 rounded-xl border-slate-200 text-slate-500 hover:text-cyan-700 hover:border-cyan-200">
              View All Alerts
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
