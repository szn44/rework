"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      <div data-radix-scroll-area-viewport className="h-full w-full">
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }