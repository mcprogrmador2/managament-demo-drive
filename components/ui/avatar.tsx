"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

function Avatar({
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      src={src}
      alt={alt}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
