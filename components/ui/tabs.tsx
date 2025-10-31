"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  className?: string
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children?: React.ReactNode
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children?: React.ReactNode
}

function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [activeValue, setActiveValue] = React.useState(value || defaultValue || "")
  
  const handleValueChange = (newValue: string) => {
    setActiveValue(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeValue,
            onValueChange: handleValueChange
          } as Record<string, unknown>)
        }
        return child
      })}
    </div>
  )
}

function TabsList({ children, className, activeValue, onValueChange }: TabsListProps & Record<string, unknown>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeValue,
            onValueChange
          } as Record<string, unknown>)
        }
        return child
      })}
    </div>
  )
}

function TabsTrigger({ value, children, className, activeValue, onValueChange }: TabsTriggerProps & { activeValue?: string; onValueChange?: (value: string) => void }) {
  const isActive = activeValue === value
  
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "hover:bg-background/50",
        className
      )}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children, className, activeValue }: TabsContentProps & Record<string, unknown>) {
  if (activeValue !== value) return null
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}