// External Libraries
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

// Types
import type { ShowToastParams, ToastContextValue, ToastVariant } from "./types"

interface Props {
  children: React.ReactNode
}

interface ToastItem extends Required<ShowToastParams> {
  id: number
}

const TOAST_DURATION = 3000

const TOAST_VARIANTS: Record<ToastVariant, string> = {
  success: "border-success-200 bg-success-500 text-white",
  error: "border-danger-200 bg-danger-50 text-danger-800",
  warning: "border-warning-200 bg-warning-50 text-warning-800",
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider: React.FC<Props> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutRef = useRef(new Map<number, number>())

  const removeToast = useCallback((id: number) => {
    const timeoutId = timeoutRef.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutRef.current.delete(id)
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  const showToast = useCallback(
    ({ duration = TOAST_DURATION, message, variant }: ShowToastParams) => {
      const toastId = Date.now() + Math.floor(Math.random() * 1000)

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id: toastId,
          duration,
          message,
          variant,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        removeToast(toastId)
      }, duration)

      timeoutRef.current.set(toastId, timeoutId)
    },
    [removeToast]
  )

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })

      timeoutRef.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ${TOAST_VARIANTS[toast.variant]}`}
            >
              <p className="flex-1 text-sm font-medium leading-5">
                {toast.message}
              </p>

              <button
                type="button"
                aria-label="Fechar notificacao"
                className="rounded-md p-1 text-current/80 transition hover:bg-black/5 hover:text-current"
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToastContext must be used inside ToastProvider")
  }

  return context
}
