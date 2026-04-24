// External Libraries
import { createContext, useContext, useState } from "react"

// Constants
import { INITIAL_SOLICITATIONS } from "../../constants"

// Types
import type { Solicitation, SolicitationStatus } from "../../types"
import type {
  SolicitationsContextValue,
  SolicitationsProviderProps,
} from "./types"

const SolicitationsContext = createContext<SolicitationsContextValue | null>(
  null
)

export const SolicitationsProvider: React.FC<SolicitationsProviderProps> = ({
  children,
}) => {
  const [solicitations, setSolicitations] =
    useState<Solicitation[]>(INITIAL_SOLICITATIONS)

  function updateSolicitationStatus(id: number, status: SolicitationStatus) {
    setSolicitations((currentSolicitations) =>
      currentSolicitations.map((solicitation) =>
        solicitation.id === id ? { ...solicitation, status } : solicitation
      )
    )
  }

  const value: SolicitationsContextValue = {
    solicitations,
    updateSolicitationStatus,
  }

  return (
    <SolicitationsContext.Provider value={value}>
      {children}
    </SolicitationsContext.Provider>
  )
}

export function useSolicitationsContext() {
  const context = useContext(SolicitationsContext)

  if (!context) {
    throw new Error(
      "useSolicitationsContext must be used inside SolicitationsProvider"
    )
  }

  return context
}
