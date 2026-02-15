"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false)
    const [showForgotPasswordDialog, setShowForgotPasswordDialog] = React.useState(false)
    const [isResetEmailSent, setIsResetEmailSent] = React.useState(false)
    const [resetEmail, setResetEmail] = React.useState("")

    const handleResetPassword = () => {
        // Mock API call
        setTimeout(() => {
            setIsResetEmailSent(true)
        }, 1000)
    }

    const handleCloseDialog = () => {
        setShowForgotPasswordDialog(false)
        setIsResetEmailSent(false)
        setResetEmail("")
    }

    return (
        <div className="w-full max-w-lg mx-auto">


            {/* Login Card */}
            <div className="clay-card p-8 md:p-10 space-y-8 bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-cyan-900">Welcome Back</h2>
                    <p className="text-slate-500 text-sm mt-2">Please sign in to your dashboard</p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <Input
                            type="email"
                            className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowForgotPasswordDialog(true)}
                                className="text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                className="h-12 rounded-xl clay-inset border-0 pl-4 pr-10 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-cyan-600 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">Toggle password visibility</span>
                            </Button>
                        </div>
                    </div>
                </div>



                <Button className="w-full h-14 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/20 border-0 rounded-xl font-bold tracking-wide clay-button text-lg transition-transform active:scale-95">
                    Sign In
                </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
                <p className="text-slate-500 text-sm font-medium">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline underline-offset-4 transition-all">
                        Request Access
                    </Link>
                </p>
            </div>

            {/* Forgot Password Dialog */}
            <Dialog open={showForgotPasswordDialog} onOpenChange={handleCloseDialog}>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-900 font-bold text-xl">
                            {isResetEmailSent ? "Check your inbox" : "Reset Password"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            {isResetEmailSent
                                ? `We have sent a password reset link to ${resetEmail}. Please check your email to continue.`
                                : "Enter your email address and we'll send you a link to reset your password."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {!isResetEmailSent ? (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <Input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                                />
                            </div>
                            <DialogFooter className="flex-col sm:justify-between gap-2 mt-4">
                                <Button variant="ghost" onClick={handleCloseDialog} className="w-full sm:w-auto text-slate-500">
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-cyan-700 text-white hover:bg-cyan-600 font-bold w-full sm:w-auto"
                                    onClick={handleResetPassword}
                                    disabled={!resetEmail}
                                >
                                    Send Reset Link
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <DialogFooter className="sm:justify-center">
                            <Button
                                className="bg-cyan-700 text-white hover:bg-cyan-600 font-bold w-full"
                                onClick={handleCloseDialog}
                            >
                                Back to Login
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
