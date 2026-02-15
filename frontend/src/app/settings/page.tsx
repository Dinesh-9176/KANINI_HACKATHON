"use client"

import * as React from "react"
import { Bell, ShieldAlert, User, Building, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function SettingsPage() {
    const [riskThreshold, setRiskThreshold] = React.useState([85])
    const { theme, setTheme } = useTheme()

    // Toggle Dark Mode
    const toggleTheme = (checked: boolean) => {
        setTheme(checked ? "dark" : "light")
    }

    const isDarkMode = theme === "dark"

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your profile, preferences, and system configurations.</p>
            </div>

            {/* 1️⃣ Profile Section (Enhanced) */}
            <Card className="border-l-4 border-l-cyan-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="h-6 w-6 text-cyan-600" />
                        User Profile
                    </CardTitle>
                    <CardDescription>Manage your account details and role.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0">
                            <div className="h-24 w-24 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-3xl font-bold shadow-inner">
                                DS
                            </div>
                        </div>
                        <div className="grid gap-4 flex-1 w-full md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input defaultValue="Dr. Sarah Smith" />
                            </div>
                            <div className="space-y-2">
                                <Label>Professional Title</Label>
                                <Input defaultValue="Chief Medical Officer" readOnly className="bg-slate-50 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input defaultValue="dr.smith@hospitalsystem.com" readOnly className="bg-slate-50 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-slate-50 text-sm text-muted-foreground">
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                    <span>System Administrator</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
                    <Button variant="outline">Change Password</Button>
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 2️⃣ Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the interface theme.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode</Label>
                                <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                            </div>
                            <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
                        </div>
                    </CardContent>
                </Card>

                {/* 3️⃣ Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage how you receive alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="critical-alerts">Critical Patient Alerts</Label>
                            <Switch id="critical-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dept-overload">Department Overload</Label>
                            <Switch id="dept-overload" defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4️⃣ AI Risk Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" />
                        AI Risk Thresholds
                    </CardTitle>
                    <CardDescription>Set the sensitivity for automatic risk flagging.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Critical Alert Threshold</Label>
                            <span className="text-sm font-medium text-muted-foreground">{riskThreshold}% Probability</span>
                        </div>
                        <Slider
                            value={riskThreshold}
                            onValueChange={setRiskThreshold}
                            max={100}
                            step={1}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground">
                            Patients with AI risk score above {riskThreshold}% will trigger immediate critical alerts to the ER team.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 5️⃣ System Info */}
            <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                    <div className="grid gap-1">
                        <div className="flex gap-2">
                            <span className="font-semibold">Version:</span>
                            <span className="text-muted-foreground">v2.4.0 (Stable)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-semibold">Last Updated:</span>
                            <span className="text-muted-foreground">February 15, 2026</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Check for Updates</Button>
                </CardContent>
            </Card>
        </div>
    )
}
