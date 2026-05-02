// External Libraries
import { createContext, useContext, useEffect, useState } from "react"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"

// Services
import { getAdjustmentRequests, reviewAdjustmentRequest } from "@/services/domain"

// Types
import type { Solicitation, SolicitationStatus } from "../../types"
import type {
  SolicitationsContextValue,
  SolicitationsProviderProps,
} from "./types"

// Utils
import { getErrorMessage } from "@/utils/getErrorMessage"
import { mapAdjustmentApiToSolicitation } from "../../utils"
import {
  mapSolicitationStatusToRequestStatus,
  updateSolicitationsStatus,
} from "./utils"

const SolicitationsContext = createContext<SolicitationsContextValue | null>(
  null
)

export const SolicitationsProvider: React.FC<SolicitationsProviderProps> = ({
  children,
}) => {
  const [solicitations, setSolicitations] = useState<Solicitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToastContext()

  useEffect(() => {
    void loadSolicitations()
  }, [])

  async function loadSolicitations() {
    try {
      setIsLoading(true)
      const items = await getAdjustmentRequests()
      setSolicitations(items.map(mapAdjustmentApiToSolicitation))
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel carregar as solicitacoes de ajuste."
        ),
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateSolicitationStatus(id: number, status: SolicitationStatus) {
    try {
      const requestStatus = mapSolicitationStatusToRequestStatus(status)

      await reviewAdjustmentRequest(id, { status: requestStatus })

      setSolicitations((currentSolicitations) =>
        updateSolicitationsStatus(currentSolicitations, id, status)
      )

      showToast({
        variant: "success",
        message:
          status === "Aprovado"
            ? "Solicitacao aprovada com sucesso."
            : "Solicitacao recusada com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel atualizar o status da solicitacao."
        ),
      })

      throw error
    }
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
