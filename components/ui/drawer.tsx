"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DrawerContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextType | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error("useDrawer must be used within a Drawer")
  }
  return context
}

interface DrawerProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Drawer({ children, open, onOpenChange }: DrawerProps) {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      <div data-slot="drawer">
        {children}
      </div>
    </DrawerContext.Provider>
  )
}

interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

function DrawerTrigger({ children, onClick, ...props }: DrawerTriggerProps) {
  const { setIsOpen } = useDrawer()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true)
    onClick?.(event)
  }

  return (
    <button
      data-slot="drawer-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface DrawerPortalProps {
  children: React.ReactNode
}

function DrawerPortal({ children }: DrawerPortalProps) {
  return (
    <div data-slot="drawer-portal">
      {children}
    </div>
  )
}

interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

function DrawerClose({ children, onClick, ...props }: DrawerCloseProps) {
  const { setIsOpen } = useDrawer()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(false)
    onClick?.(event)
  }

  return (
    <button
      data-slot="drawer-close"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface DrawerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  const { isOpen, setIsOpen } = useDrawer()

  if (!isOpen) return null

  return (
    <div
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 animate-in fade-in-0",
        className
      )}
      onClick={() => setIsOpen(false)}
      {...props}
    />
  )
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  const { isOpen } = useDrawer()

  if (!isOpen) return null

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t",
          "animate-in slide-in-from-bottom-4",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
        {children}
      </div>
    </DrawerPortal>
  )
}

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <p
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
