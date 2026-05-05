// External Libraries
import { createContext, useContext, useEffect, useMemo } from "react"
import { useSWRConfig } from "swr"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"

// Services
import { reviewAdjustmentRequest } from "@/services/domain"
import {
  swrKeyStartsWith,
  swrKeys,
  useAdjustmentRequestsSWR,
} from "@/hooks/swr"

// Types
import type { Solicitation, SolicitationStatus } from "../../types"
import type {
  SolicitationsContextValue,
  SolicitationsProviderProps,
} from "./types"

// Utils
import { getErrorMessage } from "@/utils/getErrorMessage"
import { mapAdjustmentApiToSolicitation } from "../../utils"
import { mapSolicitationStatusToRequestStatus } from "./utils"

const SolicitationsContext = createContext<SolicitationsContextValue | null>(
  null
)

export const SolicitationsProvider: React.FC<SolicitationsProviderProps> = ({
  children,
}) => {
  const { showToast } = useToastContext()
  const { mutate: mutateSWRCache } = useSWRConfig()
  const {
    data: adjustmentRequests = [],
    error,
    isLoading,
  } = useAdjustmentRequestsSWR()

  const solicitations = useMemo<Solicitation[]>(
    () => adjustmentRequests.map(mapAdjustmentApiToSolicitation),
    [adjustmentRequests]
  )

  useEffect(() => {
    if (!error) return

    showToast({
      variant: "error",
      message: getErrorMessage(
        error,
        "Nao foi possivel carregar as solicitacoes de ajuste."
      ),
    })
  }, [error, showToast])

  async function updateSolicitationStatus(id: number, status: SolicitationStatus) {
    try {
      const requestStatus = mapSolicitationStatusToRequestStatus(status)

      await reviewAdjustmentRequest(id, { status: requestStatus })
      await Promise.all([
        mutateSWRCache(
          swrKeyStartsWith(swrKeys.adjustmentRequests.list())
        ),
        mutateSWRCache(swrKeyStartsWith(swrKeys.analytics.dashboard())),
      ])

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
