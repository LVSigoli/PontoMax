import type { ReactNode } from "react"
import type { Solicitation, SolicitationStatus } from "../../types"

export interface SolicitationsContextValue {
  solicitations: Solicitation[]
  updateSolicitationStatus: (id: number, status: SolicitationStatus) => void
}

export interface SolicitationsProviderProps {
  children: ReactNode
}
