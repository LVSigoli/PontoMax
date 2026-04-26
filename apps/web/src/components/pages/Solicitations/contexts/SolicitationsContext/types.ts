import type { ReactNode } from "react"
import type { Solicitation, SolicitationStatus } from "../../types"

export interface SolicitationsContextValue {
  isLoading: boolean
  solicitations: Solicitation[]
  updateSolicitationStatus: (id: number, status: SolicitationStatus) => Promise<void>
}

export interface SolicitationsProviderProps {
  children: ReactNode
}
