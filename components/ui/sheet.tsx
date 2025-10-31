"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
  children?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

function Sheet({ children, onOpenChange, ...props }: SheetProps) {
  return (
    <div data-slot="sheet" {...props}>
      {children}
    </div>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

function SheetTrigger({ children, ...props }: SheetTriggerProps) {
  return (
    <button data-slot="sheet-trigger" {...props}>
      {children}
    </button>
  )
}

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

function SheetClose({ children, ...props }: SheetCloseProps) {
  return (
    <button data-slot="sheet-close" {...props}>
      {children}
    </button>
  )
}

interface SheetPortalProps {
  children?: React.ReactNode
}

function SheetPortal({ children }: SheetPortalProps) {
  return (
    <div data-slot="sheet-portal">
      {children}
    </div>
  )
}

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <div
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <div
        data-slot="sheet-content"
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <div
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <div
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
