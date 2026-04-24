// External Libraries
import React, { forwardRef, useId, useImperativeHandle } from "react"

// Contexts
import { useModalContext } from "@/contexts/ModalContext"

// Types
import type { ModalMethods, ModalProps } from "./types"

export const Modal = forwardRef<ModalMethods, ModalProps>(
  (
    {
      children,
      className = "",
      closeOnBackdropClick = true,
      id,
    },
    ref
  ) => {
    // Hooks
    const generatedId = useId()
    const modalId = id ?? generatedId
    const { activeModalId, closeModal, openModal } = useModalContext()

    const isOpen = activeModalId === modalId

    useImperativeHandle(
      ref,
      () => ({
        close: closeModal,
        open: () => openModal(modalId),
        toggle: () => {
          if (isOpen) {
            closeModal()
            return
          }

          openModal(modalId)
        },
      }),
      [closeModal, isOpen, modalId, openModal]
    )

    if (!isOpen) return null

    return (
      <div
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-5 py-6 backdrop-blur-sm"
        role="dialog"
      >
        <button
          aria-label="Fechar modal"
          className="absolute inset-0 size-full cursor-default"
          type="button"
          onClick={closeOnBackdropClick ? closeModal : undefined}
        />

        <div
          className={`relative z-10 w-full max-w-md rounded-2xl border border-border-subtle bg-surface-overlay p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${className}`}
        >
          {children}
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

export type { ModalMethods, ModalProps } from "./types"
