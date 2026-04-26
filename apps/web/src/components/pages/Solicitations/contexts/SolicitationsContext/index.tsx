// External Libraries
import { createContext, useContext, useEffect, useState } from "react"

// Services
import { getAdjustmentRequests, reviewAdjustmentRequest } from "@/services/domain"

// Types
import type { Solicitation, SolicitationStatus } from "../../types"
import type {
  SolicitationsContextValue,
  SolicitationsProviderProps,
} from "./types"

// Utils
import { mapAdjustmentApiToSolicitation } from "../../utils"

const SolicitationsContext = createContext<SolicitationsContextValue | null>(
  null
)

export const SolicitationsProvider: React.FC<SolicitationsProviderProps> = ({
  children,
}) => {
  const [solicitations, setSolicitations] = useState<Solicitation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadSolicitations()
  }, [])

  async function loadSolicitations() {
    try {
      setIsLoading(true)
      const items = await getAdjustmentRequests()
      setSolicitations(items.map(mapAdjustmentApiToSolicitation))
    } finally {
      setIsLoading(false)
    }
  }

  async function updateSolicitationStatus(id: number, status: SolicitationStatus) {
    const requestStatus = status === "Aprovado" ? "APPROVED" : "REJECTED"

    await reviewAdjustmentRequest(id, { status: requestStatus })

    setSolicitations((currentSolicitations) =>
      currentSolicitations.map((solicitation) =>
        solicitation.id === id ? { ...solicitation, status } : solicitation
      )
    )
  }

  const value: SolicitationsContextValue = {
    isLoading,
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
