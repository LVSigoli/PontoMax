export type ToastVariant = "success" | "error" | "warning"

export interface ShowToastParams {
  variant: ToastVariant
  message: string
  duration?: number
}

export interface ToastContextValue {
  showToast: (toast: ShowToastParams) => void
}
