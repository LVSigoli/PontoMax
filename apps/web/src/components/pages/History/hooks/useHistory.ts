import { useEffect, useState } from "react"

import {
  getAdjustmentRequests,
  getTimeRecordsOverview,
  type PaginationMeta,
} from "@/services/domain"
import {
  formatHoursWithMinutes,
  formatMinutes,
  formatTimeLabel,
  getErrorMessage,
} from "@/services/utils"

import type { SolicitationHistoryItem, UserAnalysisItem } from "../types"

const HISTORY_PAGE_SIZE = 10

export function useHistory() {
  const [analysisItems, setAnalysisItems] = useState<UserAnalysisItem[]>([])
  const [historyItems, setHistoryItems] = useState<SolicitationHistoryItem[]>(
    []
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: HISTORY_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  })

  useEffect(() => {
    void loadHistory(1)
  }, [])

  async function loadHistory(page: number) {
    try {
      setErrorMessage("")

      const [overview, adjustments] = await Promise.all([
        getTimeRecordsOverview({
          page,
          pageSize: HISTORY_PAGE_SIZE,
        }),
        getAdjustmentRequests(),
      ])

      const pendingCount = adjustments.filter(
        (adjustment) => adjustment.status === "PENDING"
      ).length

      setPagination(overview.meta)

      setAnalysisItems([
        {
          label: "Dias trabalhados",
          data: `${overview.summary.workedDays} dias`,
          type: "worked-days",
          subtitle: "Quantidade de dias trabalhados no periodo carregado",
        },
        {
          label: "Saldo de horas",
          data: formatMinutes(overview.summary.balanceMinutes),
          type: "hour-balance",
          subtitle: "Total acumulado de horas extras e faltas",
        },
        {
          label: "Ajustes pendentes",
          data: `${pendingCount} solicitacoes`,
          type: "pending",
          subtitle: "Solicitacoes de correcao aguardando aprovacao",
        },
        {
          label: "Inconsistencias",
          data: `${overview.summary.inconsistentCount} registros`,
          type: "issues",
          subtitle: "Casos com falta de registros ou jornadas incompletas",
        },
      ])

      setHistoryItems(
        overview.items.map((workday) => ({
          id: workday.id,
          lastSolicitationTime:
            workday.timeEntries.at(-1)?.recordedAt
              ? formatTimeLabel(workday.timeEntries.at(-1)!.recordedAt)
              : "-",
          extraHours: formatHoursWithMinutes(workday.overtimeMinutes),
          missingHours: formatHoursWithMinutes(workday.missingMinutes),
          status:
            workday.status === "INCONSISTENT" ||
            workday.status === "PENDING_ADJUSTMENT"
              ? "Inconsistente"
              : workday.status === "ADJUSTED"
                ? "Registrado"
                : "Registrado",
        }))
      )
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel carregar o historico.")
      )
    }
  }

  function handlePreviousPage() {
    if (pagination.page <= 1) {
      return
    }

    const nextPage = pagination.page - 1
    void loadHistory(nextPage)
  }

  function handleNextPage() {
    if (pagination.totalPages === 0 || pagination.page >= pagination.totalPages) {
      return
    }

    const nextPage = pagination.page + 1
    void loadHistory(nextPage)
  }

  return {
    analysisItems,
    errorMessage,
    historyItems,
    pagination,
    handlePreviousPage,
    handleNextPage,
  }
}
