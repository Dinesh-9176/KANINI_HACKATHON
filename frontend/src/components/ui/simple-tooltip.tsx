import * as React from "react"
import { cn } from "@/lib/utils"

interface SimpleTooltipProps {
    children: React.ReactNode
    content: string | React.ReactNode
    className?: string
}

export function SimpleTooltip({ children, content, className }: SimpleTooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false)

    return (
        <div
            className={cn("relative inline-block", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-xl -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-max max-w-[250px] pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    {content}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
            )}
        </div>
    )
}
