// External Libraries
import { useEffect, useMemo, useState } from "react"

//  Components
import type { SelectionOption } from "@/components/structure/Select/types"

// Hooks
import { useAuth } from "@/contexts/AuthContext"

// Utils
import {
  buildAnalyticsMetrics,
  buildBalances,
  buildCompanyOptions,
} from "./utils"

// Services
import { getAnalyticsDashboard, getCompanies } from "@/services/domain"

// Types
import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../../types"

export function useAnalytics() {
  //  States
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [balances, setBalances] = useState<EmployeeHourBalance[]>([])
  const [solicitationChart, setSolicitationChart] = useState<
    SolicitationChartItem[]
  >([])
  const [workedHours, setWorkedHours] = useState<WorkedHoursItem[]>([])
  const [companyOptions, setCompanyOptions] = useState<SelectionOption[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState("all")
  const [errorMessage, setErrorMessage] = useState("")

  // Hooks
  const { user } = useAuth()

  // Constants
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const selectedCompanyOption = useMemo(() => {
    return companyOptions.filter((option) => option.value === selectedCompanyId)
  }, [selectedCompanyId])

  // Effects
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

      const options = buildCompanyOptions(companies)

      setCompanyOptions(options)
    } catch (error) {
      console.log(error)
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

      const dashboardMetrics = buildAnalyticsMetrics(dashboard)
      const balances = buildBalances(dashboard)

      setMetrics(dashboardMetrics)

      setBalances(balances)

      setSolicitationChart(dashboard.solicitationChart)
      setWorkedHours(dashboard.workedHours)
    } catch (error) {
      console.log(error)
    }
  }

  function handleCompanyFilterChange(selection: SelectionOption[]) {
    const nextCompanyId = selection[0]?.value

    if (!nextCompanyId) return

    setSelectedCompanyId(nextCompanyId)
  }

  return {
    metrics,
    balances,
    workedHours,
    errorMessage,
    companyOptions,
    isPlatformAdmin,
    solicitationChart,
    selectedCompanyOption,
    handleCompanyFilterChange,
  }
}
