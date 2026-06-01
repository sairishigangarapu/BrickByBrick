import React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-brand-primary",
        {
          "bg-foreground text-white border border-transparent": variant === "default",
          "bg-brand-surface text-foreground border border-transparent": variant === "secondary",
          "bg-brand-primary text-white border border-transparent": variant === "destructive",
          "text-foreground border border-gray-200": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
