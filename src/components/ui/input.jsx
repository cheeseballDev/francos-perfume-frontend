import * as React from "react"

import { cn } from "@/lib/utils"
import { blockInvalidNumberKeys, blockInvalidNumberPaste } from "@/utils/numberInputUtils"

function Input({
  className,
  type,
  onKeyDown,
  onPaste,
  ...props
}) {
  const isNumber = type === "number"

  const handleKeyDown = (event) => {
    if (isNumber) blockInvalidNumberKeys(event)
    if (!event.defaultPrevented) onKeyDown?.(event)
  }

  const handlePaste = (event) => {
    if (isNumber) blockInvalidNumberPaste(event)
    if (!event.defaultPrevented) onPaste?.(event)
  }

  return (
    <input
      type={type}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
}

export { Input }
