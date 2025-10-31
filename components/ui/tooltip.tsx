"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
  delayDuration?: number
  children?: React.ReactNode
}

function TooltipProvider({
  delayDuration = 0,
  children,
  ...props
}: TooltipProviderProps) {
  return (
    <div
      data-slot="tooltip-provider"
      {...props}
    >
      {children}
    </div>
  )
}

interface TooltipProps {
  children?: React.ReactNode
}

function Tooltip({ children, ...props }: TooltipProps) {
  return (
    <TooltipProvider>
      <div data-slot="tooltip" {...props}>
        {children}
      </div>
    </TooltipProvider>
  )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  asChild?: boolean
}

function TooltipTrigger({ children, asChild, ...props }: TooltipTriggerProps) {
  return (
    <div data-slot="tooltip-trigger" {...props}>
      {children}
    </div>
  )
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
  children?: React.ReactNode
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "bg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
