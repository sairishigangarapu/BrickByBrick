"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden bg-gray-100", className)}
        {...props}
      >
        <motion.div
          className="h-full bg-brand-primary"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
