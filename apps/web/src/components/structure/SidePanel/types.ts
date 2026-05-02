import type { ReactNode } from "react"

export interface SidePanelMethods {
  close: () => void
  open: () => void
  toggle: () => void
}

export interface SidePanelProps {
  children: ReactNode
  className?: string
  closeOnBackdropClick?: boolean
  id?: string
  widthClassName?: string
  title: string
  subtitle?: string
}
