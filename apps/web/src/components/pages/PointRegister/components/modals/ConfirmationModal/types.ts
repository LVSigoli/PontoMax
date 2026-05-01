import type { ModalMethods } from "@/components/structure/Modal"

export type ConfirmationModalMethods = ModalMethods

export interface ConfirmationModalProps {
  currentTime: string
  onConfirm: () => Promise<void> | void
}
