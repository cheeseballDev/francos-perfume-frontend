import * as React from "react"
import { cn } from "@/lib/utils"

// A thin divider line — horizontal by default, can be set to vertical.
// Use `decorative={false}` when the separator has semantic meaning for screen readers.
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative ? orientation : undefined}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
