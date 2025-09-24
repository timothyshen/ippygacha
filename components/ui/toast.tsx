"use client"

import * as React from "react"

export type ToastActionElement = React.ReactElement | null

export interface ToastProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Minimal placeholder components to satisfy imports. Implement UI as needed.
export function Toaster(_props: { className?: string }) {
  return null
}

