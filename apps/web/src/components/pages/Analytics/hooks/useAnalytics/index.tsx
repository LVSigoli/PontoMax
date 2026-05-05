// External Libraries
import { useMemo, useState } from "react"

//  Components
import type { SelectionOption } from "@/components/structure/Select/types"

// Hooks
import { useAuth } from "@/contexts/AuthContext"
import { useAnalyticsDashboardSWR, useCompaniesSWR } from "@/hooks/swr"

// Utils
import {
  buildAnalyticsMetrics,
  buildBalances,
  buildCompanyOptions,
} from "./utils"

// Types
import { getErrorMessage } from "@/utils/getErrorMessage"
import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../../types"

export function useAnalytics() {
  const [selectedCompanyId, setSelectedCompanyId] = useState("all")

  // Hooks
  const { user } = useAuth()

  // Constants
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const selectedCompanyParams =
    isPlatformAdmin && selectedCompanyId !== "all"
      ? { companyId: Number(selectedCompanyId) }
      : undefined

  // Hooks
  const { data: companies = [] } = useCompaniesSWR({ enabled: isPlatformAdmin })
  const { data: dashboard, error } = useAnalyticsDashboardSWR(
    selectedCompanyParams,
    { enabled: Boolean(user) }
  )

  // Constants
  const metrics = useMemo<AnalyticsMetric[]>(
    () => (dashboard ? buildAnalyticsMetrics(dashboard) : []),
    [dashboard]
  )
  const balances = useMemo<EmployeeHourBalance[]>(
    () => (dashboard ? buildBalances(dashboard) : []),
    [dashboard]
  )
  const solicitationChart = useMemo<SolicitationChartItem[]>(
    () => dashboard?.solicitationChart ?? [],
    [dashboard]
  )
  const workedHours = useMemo<WorkedHoursItem[]>(
    () => dashboard?.workedHours ?? [],
    [dashboard]
  )
  const companyOptions = useMemo(
    () => (isPlatformAdmin ? buildCompanyOptions(companies) : []),
    [companies, isPlatformAdmin]
  )
  const errorMessage = useMemo(
    () =>
      error
        ? getErrorMessage(
            error,
            "Nao foi possivel carregar os dados do painel."
          )
        : "",
    [error]
  )
  const selectedCompanyOption = useMemo(() => {
    return companyOptions.filter((option) => option.value === selectedCompanyId)
  }, [companyOptions, selectedCompanyId])

  // Functions
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
