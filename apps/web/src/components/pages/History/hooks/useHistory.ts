import { useEffect, useState } from "react"

import { getAdjustmentRequests, getTimeRecords } from "@/services/domain"
import {
  formatHoursWithMinutes,
  formatMinutes,
  formatTimeLabel,
  getErrorMessage,
} from "@/services/utils"

import type { SolicitationHistoryItem, UserAnalysisItem } from "../types"

export function useHistory() {
  const [analysisItems, setAnalysisItems] = useState<UserAnalysisItem[]>([])
  const [historyItems, setHistoryItems] = useState<SolicitationHistoryItem[]>(
    []
  )
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    void loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setErrorMessage("")

      const [workdays, adjustments] = await Promise.all([
        getTimeRecords(),
        getAdjustmentRequests(),
      ])

      const workedDays = workdays.filter((workday) => workday.workedMinutes > 0).length
      const balanceMinutes = workdays.reduce(
        (total, workday) => total + workday.overtimeMinutes - workday.missingMinutes,
        0
      )
      const pendingCount = adjustments.filter(
        (adjustment) => adjustment.status === "PENDING"
      ).length
      const inconsistentCount = workdays.filter(
        (workday) =>
          workday.status === "INCONSISTENT" || workday.status === "PENDING_ADJUSTMENT"
      ).length

      setAnalysisItems([
        {
          label: "Dias trabalhados",
          data: `${workedDays} dias`,
          type: "worked-days",
          subtitle: "Quantidade de dias trabalhados no periodo carregado",
        },
        {
          label: "Saldo de horas",
          data: formatMinutes(balanceMinutes),
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
          data: `${inconsistentCount} registros`,
          type: "issues",
          subtitle: "Casos com falta de registros ou jornadas incompletas",
        },
      ])

      setHistoryItems(
        workdays.map((workday) => ({
          id: workday.id,
          lastSolicitationTime:
            workday.timeEntries.at(-1)?.recordedAt
              ? formatTimeLabel(workday.timeEntries.at(-1)!.recordedAt)
              : "-",
          extraHours: formatHoursWithMinutes(workday.overtimeMinutes),
          missingHours: formatHoursWithMinutes(workday.missingMinutes),
          status:
            workday.status === "INCONSISTENT" || workday.status === "PENDING_ADJUSTMENT"
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

  return {
    analysisItems,
    errorMessage,
    historyItems,
  }
}
