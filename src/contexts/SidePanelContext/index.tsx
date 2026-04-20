// External Libraries
import React, { createContext, useContext, useState } from "react"

// Types
import type { SidePanelContextValue } from "./types"

const SidePanelContext = createContext<SidePanelContextValue | null>(null)

interface Props {
  children: React.ReactNode
}

export const SidePanelProvider: React.FC<Props> = ({ children }) => {
  // States
  const [activeSidePanelId, setActiveSidePanelId] = useState<string | null>(null)

  // Functions
  function openSidePanel(id: string) {
    setActiveSidePanelId(id)
  }

  function closeSidePanel() {
    setActiveSidePanelId(null)
  }

  return (
    <SidePanelContext.Provider
      value={{ activeSidePanelId, closeSidePanel, openSidePanel }}
    >
      {children}
    </SidePanelContext.Provider>
  )
}

export function useSidePanelContext() {
  const context = useContext(SidePanelContext)

  if (!context) {
    throw new Error("useSidePanelContext must be used inside SidePanelProvider")
  }

  return context
}
