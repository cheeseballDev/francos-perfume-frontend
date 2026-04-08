import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Variant definitions for the Badge component.
// "outline" is the most commonly used in this project — a bordered, transparent pill.
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        // Solid primary colour — used for prominent labels
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        // Subtle secondary — muted background
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Destructive — red, used for errors or warnings
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        // Outline — transparent with a border; lightest weight option
        outline:
          "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// A small inline label for status, category, or metric annotations.
// Accepts all div props plus a `variant` key for styling.
function Badge({ className, variant, ...props }) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
