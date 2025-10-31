"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupContextType {
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  type?: "single" | "multiple"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextType>({
  size: "default",
  variant: "default",
  type: "single",
})

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
  children?: React.ReactNode
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  type = "single",
  value,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(
    () => ({ variant, size, value, onValueChange, type }),
    [variant, size, value, onValueChange, type]
  )

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        className={cn(
          "group/toggle-group flex w-fit items-center rounded-md",
          variant === "outline" && "shadow-xs",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children?: React.ReactNode
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  const finalVariant = variant || context.variant || "default"
  const finalSize = size || context.size || "default"

  const isSelected = React.useMemo(() => {
    if (!context.value) return false
    if (context.type === "multiple") {
      return Array.isArray(context.value) && context.value.includes(value)
    }
    return context.value === value
  }, [context.value, context.type, value])

  const handleClick = () => {
    if (!context.onValueChange) return

    if (context.type === "multiple") {
      const currentValue = Array.isArray(context.value) ? context.value : []
      const newValue = currentValue.includes(value)
        ? currentValue.filter(v => v !== value)
        : [...currentValue, value]
      context.onValueChange(newValue)
    } else {
      context.onValueChange(value)
    }
  }

  return (
    <button
      data-slot="toggle-group-item"
      data-variant={finalVariant}
      data-size={finalSize}
      data-state={isSelected ? "on" : "off"}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        
        // Size variants
        finalSize === "sm" && "h-9 px-2.5",
        finalSize === "default" && "h-10 px-3",
        finalSize === "lg" && "h-11 px-5",
        
        // Variant styles
        finalVariant === "default" && [
          "bg-transparent hover:bg-muted hover:text-muted-foreground",
          isSelected && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
        ],
        finalVariant === "outline" && [
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground"
        ],
        
        // Toggle group specific styles
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10",
        finalVariant === "outline" && "border-l-0 first:border-l",
        
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
