// External Libraries
import React, { createContext, useContext, useState } from "react"

// Types
import type { ModalContextValue } from "./types"

const ModalContext = createContext<ModalContextValue | null>(null)

interface Props {
  children: React.ReactNode
}

export const ModalProvider: React.FC<Props> = ({ children }) => {
  // States
  const [activeModalId, setActiveModalId] = useState<string | null>(null)

  // Functions
  function openModal(id: string) {
    setActiveModalId(id)
  }

  function closeModal() {
    setActiveModalId(null)
  }

  return (
    <ModalContext.Provider value={{ activeModalId, closeModal, openModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModalContext() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("useModalContext must be used inside ModalProvider")
  }

  return context
}
