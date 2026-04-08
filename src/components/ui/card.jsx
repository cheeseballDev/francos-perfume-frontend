import * as React from "react"
import { cn } from "@/lib/utils"

// Root card container — rounded, bordered, white background with subtle shadow.
// Passes all native div props through so consumers can add onClick, etc.
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
        className
      )}
      {...props}
    />
  )
}

// Top section of a card — contains the title and description.
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-0", className)}
      {...props}
    />
  )
}

// Bold label at the top of the card.
function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

// Muted subtitle rendered below the card title.
function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

// Main body of the card where the primary content lives.
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 py-6", className)}
      {...props}
    />
  )
}

// Optional footer section — useful for action buttons or meta information.
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
