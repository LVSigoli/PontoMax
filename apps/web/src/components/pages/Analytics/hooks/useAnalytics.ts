import { useEffect, useState } from "react"

import { getAnalyticsDashboard } from "@/services/domain"
import {
  formatHoursWithMinutes,
  formatMinutes,
  getErrorMessage,
} from "@/services/utils"

import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../types"

export function useAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [balances, setBalances] = useState<EmployeeHourBalance[]>([])
  const [solicitationChart, setSolicitationChart] = useState<
    SolicitationChartItem[]
  >([])
  const [workedHours, setWorkedHours] = useState<WorkedHoursItem[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setErrorMessage("")

      const dashboard = await getAnalyticsDashboard()

      setMetrics([
        {
          label: "Funcionarios presentes hoje",
          data: `${dashboard.metrics.presentEmployees}/${dashboard.metrics.companyEmployees}`,
          type: "present",
          subtitle: "Quantidade de funcionarios que ja registraram entrada hoje",
        },
        {
          label: "Horas extras da semana",
          data: formatHoursWithMinutes(dashboard.metrics.overtimeMinutes),
          type: "extra-hours",
          subtitle: "Total acumulado de horas extras da equipe",
        },
        {
          label: "Ajustes com pendencias",
          data: `${dashboard.metrics.pendingAdjustments} solicitacoes`,
          type: "pending",
          subtitle: "Solicitacoes de correcao aguardando aprovacao",
        },
        {
          label: "Inconsistencia de pontos",
          data: `${dashboard.metrics.inconsistentWorkdays} registros`,
          type: "issues",
          subtitle: "Casos com falta de registros ou jornadas incompletas",
        },
      ])

      setBalances(
        dashboard.balances.map((item) => ({
          id: item.id,
          name: item.name,
          balance: formatMinutes(item.balanceMinutes),
          status:
            item.balanceMinutes > 0
              ? "positive"
              : item.balanceMinutes < 0
                ? "negative"
                : "neutral",
        }))
      )

      setSolicitationChart(dashboard.solicitationChart)
      setWorkedHours(dashboard.workedHours)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel carregar os indicadores.")
      )
    }
  }

  return {
    errorMessage,
    metrics,
    balances,
    solicitationChart,
    workedHours,
  }
}
