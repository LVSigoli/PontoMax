import { useEffect, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import type { SelectionOption } from "@/components/structure/Select/types"
import { getAnalyticsDashboard, getCompanies } from "@/services/domain"
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
  const { user } = useAuth()

  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [balances, setBalances] = useState<EmployeeHourBalance[]>([])
  const [solicitationChart, setSolicitationChart] = useState<
    SolicitationChartItem[]
  >([])
  const [workedHours, setWorkedHours] = useState<WorkedHoursItem[]>([])
  const [companyOptions, setCompanyOptions] = useState<SelectionOption[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState("all")
  const [errorMessage, setErrorMessage] = useState("")
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"

  useEffect(() => {
    if (!user) return

    void loadDashboard()
  }, [selectedCompanyId, user])

  useEffect(() => {
    if (!isPlatformAdmin) {
      setCompanyOptions([])
      setSelectedCompanyId("all")
      return
    }

    void loadCompanies()
  }, [isPlatformAdmin])

  async function loadCompanies() {
    try {
      const companies = await getCompanies()
      setCompanyOptions([
        { value: "all", label: "Todas as empresas" },
        ...companies.map((company) => ({
          value: String(company.id),
          label: company.tradeName || company.name,
        })),
      ])
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel carregar as empresas.")
      )
    }
  }

  async function loadDashboard() {
    try {
      setErrorMessage("")

      const dashboard = await getAnalyticsDashboard(
        isPlatformAdmin && selectedCompanyId !== "all"
          ? { companyId: Number(selectedCompanyId) }
          : undefined
      )

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

  function handleCompanyFilterChange(selection: SelectionOption[]) {
    const nextCompanyId = selection[0]?.value

    if (!nextCompanyId) return

    setSelectedCompanyId(nextCompanyId)
  }

  return {
    companyOptions,
    errorMessage,
    handleCompanyFilterChange,
    isPlatformAdmin,
    metrics,
    balances,
    selectedCompanyOption: companyOptions.filter(
      (option) => option.value === selectedCompanyId
    ),
    solicitationChart,
    workedHours,
  }
}
