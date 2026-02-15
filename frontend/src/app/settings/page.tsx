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

export default function SettingsPage() {
    const [riskThreshold, setRiskThreshold] = React.useState([85])

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your hospital dashboard preferences and configurations.</p>
            </div>

            <div className="grid gap-6">
                {/* 1️⃣ Department Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Department Management
                        </CardTitle>
                        <CardDescription>Configure active departments and capacity limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Cardiology</Label>
                                <p className="text-sm text-muted-foreground">Capacity: 45 beds</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Emergency Room</Label>
                                <p className="text-sm text-muted-foreground">Capacity: 20 beds • High Priority</p>
                            </div>
                            <Switch defaultChecked disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Pediatrics</Label>
                                <p className="text-sm text-muted-foreground">Capacity: 30 beds</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Manage All Departments</Button>
                    </CardFooter>
                </Card>

                {/* 2️⃣ Risk Threshold Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            AI Risk Thresholds
                        </CardTitle>
                        <CardDescription>Set the sensitivity for AI risk flagging.</CardDescription>
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
                            />
                            <p className="text-xs text-muted-foreground">
                                Patients with AI risk score above {riskThreshold}% will trigger immediate critical alerts.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3️⃣ Notification Preferences */}
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
                            <Label htmlFor="dept-overload">Department Overload Warnings</Label>
                            <Switch id="dept-overload" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-digest">Daily Email Digest</Label>
                            <Switch id="email-digest" />
                        </div>
                    </CardContent>
                </Card>

                {/* 4️⃣ Theme & Profile */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Moon className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Dark Mode</Label>
                                <Switch disabled title="Coming soon" />
                            </div>
                            <p className="text-xs text-muted-foreground">Dark mode is currently disabled.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Display Name</Label>
                                <Input defaultValue="Dr. Smith" />
                            </div>
                            <Button className="w-full">Save Profile</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
