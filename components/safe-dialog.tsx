"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog as DialogPrimitive } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/dialog"

interface SafeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

// Componente seguro para evitar problemas com o Dialog do Radix UI
export function SafeDialog({ open, onOpenChange, children, className }: SafeDialogProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>{children}</DialogContent>
    </DialogPrimitive>
  )
}

