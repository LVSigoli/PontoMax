import type { ReactNode } from "react"

export interface ModalMethods {
  close: () => void
  open: () => void
  toggle: () => void
}

export interface ModalProps {
  children: ReactNode
  className?: string
  closeOnBackdropClick?: boolean
  id?: string
}
