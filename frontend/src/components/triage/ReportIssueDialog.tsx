import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface ReportIssueDialogProps {
    patientId: string
    patientName: string
    currentPriority: number
    trigger?: React.ReactNode
}

export function ReportIssueDialog({ patientId, patientName, currentPriority, trigger }: ReportIssueDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [issueType, setIssueType] = React.useState<string>("")
    const [details, setDetails] = React.useState("")

    const handleSubmit = async () => {
        if (!issueType) return

        setIsSubmitting(true)

        try {
            // Send to backend
            const response = await fetch('http://localhost:8000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    feedback_type: issueType,
                    details: details,
                    corrected_priority: null // Optional: could add input for this
                }),
            })

            if (response.ok) {
                // Success
                setOpen(false)
                setIssueType("")
                setDetails("")
            } else {
                console.error("Failed to submit feedback")
            }
        } catch (error) {
            console.error("Error submitting feedback:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Report Issue
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-rose-600">
                        <AlertTriangle className="h-5 w-5" />
                        Report Issue
                    </DialogTitle>
                    <DialogDescription>
                        Help improve the AI accuracy. Flag incorrect predictions for {patientName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="issue-type">Issue Type</Label>
                        <Select value={issueType} onValueChange={setIssueType}>
                            <SelectTrigger id="issue-type">
                                <SelectValue placeholder="Select type of error" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="incorrect_priority">Incorrect Priority Score</SelectItem>
                                <SelectItem value="wrong_diagnosis">Wrong AI Diagnosis</SelectItem>
                                <SelectItem value="missing_factors">Missing Risk Factors</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="details">Details</Label>
                        <Textarea
                            id="details"
                            placeholder="Describe what is wrong and what the correct assessment should be..."
                            value={details}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                            className="h-24 resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!issueType || isSubmitting} className="bg-rose-600 hover:bg-rose-500 text-white">
                        {isSubmitting ? "Reporting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
