"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function SignupPage() {
    const [showPassword, setShowPassword] = React.useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = React.useState(false)
    const router = useRouter()

    return (
        <div className="w-full max-w-lg mx-auto">


            {/* Signup Card */}
            <div className="clay-card p-8 md:p-10 space-y-6 bg-white/80 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-bold text-cyan-900">Get Started</h2>
                    <p className="text-slate-500 text-sm mt-1">Create a new account</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                            <Input
                                type="text"
                                className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                            <Input
                                type="text"
                                className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <Input
                            type="email"
                            className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Create Password</label>
                            <div className="relative mt-1">
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
                        <p className="text-[10px] text-slate-400 ml-1">Must be at least 8 characters</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Medical ID / License</label>
                        <Input
                            type="text"
                            className="h-12 rounded-xl clay-inset border-0 pl-4 focus-visible:ring-cyan-500/30 placeholder:text-slate-400 bg-cyan-50/30"
                        />
                    </div>
                </div>

                <div className="flex items-start gap-2 pt-2 ml-1">
                    <Checkbox id="terms" className="mt-1 rounded border-slate-300 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                    >
                        I agree to the <Link href="#" className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline">Privacy Policy</Link>.
                    </label>
                </div>

                <Button
                    type="button"
                    className="w-full h-14 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/20 border-0 rounded-xl font-bold tracking-wide clay-button text-lg transition-transform active:scale-95"
                    onClick={() => setShowSuccessDialog(true)}
                >
                    Create Account
                </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
                <p className="text-slate-500 text-sm font-medium">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline underline-offset-4 transition-all">
                        Sign In
                    </Link>
                </p>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-900 font-bold mb-2">Request Sent Successfully</DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Your account request has been submitted to the administration. You will receive an email once your credentials are verified.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="bg-cyan-700 text-white hover:bg-cyan-600 font-bold w-full sm:w-auto"
                            onClick={() => router.push('/login')}
                        >
                            Back to Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
