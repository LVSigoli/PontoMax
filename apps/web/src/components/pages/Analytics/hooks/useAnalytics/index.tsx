// External Libraries
import { useMemo, useState } from "react"

//  Components
import type { SelectionOption } from "@/components/structure/Select/types"

// Hooks
import { useAuth } from "@/contexts/AuthContext"
import { useAnalyticsDashboardSWR, useCompaniesSWR } from "@/hooks/swr"
import type {
  AnalyticsDashboardRequest,
  AnalyticsPeriod,
} from "@/services/domain"

// Utils
import {
  buildAnalyticsMetrics,
  buildAnalyticsPeriodSummary,
  buildBalances,
  buildCompanyOptions,
  resolveAnalyticsDateRange,
} from "./utils"

// Types
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  ANALYTICS_PERIOD_OPTIONS,
  DEFAULT_ANALYTICS_PERIOD,
} from "../../constants"
import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../../types"

export function useAnalytics() {
  const defaultRange = resolveAnalyticsDateRange(DEFAULT_ANALYTICS_PERIOD)
  const [selectedCompanyId, setSelectedCompanyId] = useState("all")
  const [selectedPeriodValue, setSelectedPeriodValue] =
    useState<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD)
  const [customFrom, setCustomFrom] = useState(defaultRange.from)
  const [customTo, setCustomTo] = useState(defaultRange.to)

  // Hooks
  const { user } = useAuth()

  // Constants
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const isCustomPeriod = selectedPeriodValue === "custom"
  const activeRange = useMemo(() => {
    if (isCustomPeriod) {
      return {
        from: customFrom,
        to: customTo,
      }
    }

    return resolveAnalyticsDateRange(selectedPeriodValue)
  }, [customFrom, customTo, isCustomPeriod, selectedPeriodValue])
  const isSingleDayRange = activeRange.from === activeRange.to
  const analyticsParams = useMemo<AnalyticsDashboardRequest>(() => {
    const params: AnalyticsDashboardRequest = {
      period: selectedPeriodValue,
    }

    if (isPlatformAdmin && selectedCompanyId !== "all") {
      params.companyId = Number(selectedCompanyId)
    }

    if (isCustomPeriod) {
      params.from = customFrom
      params.to = customTo
    }

    return params
  }, [
    customFrom,
    customTo,
    isCustomPeriod,
    isPlatformAdmin,
    selectedCompanyId,
    selectedPeriodValue,
  ])

  // Hooks
  const {
    data: companies = [],
    isLoading: isCompaniesLoading,
  } = useCompaniesSWR({ enabled: isPlatformAdmin })
  const {
    data: dashboard,
    error,
    isLoading: isDashboardLoading,
  } = useAnalyticsDashboardSWR(analyticsParams, { enabled: Boolean(user) })

  // Constants
  const metrics = useMemo<AnalyticsMetric[]>(
    () =>
      dashboard
        ? buildAnalyticsMetrics(dashboard, {
            isSingleDayRange,
          })
        : [],
    [dashboard, isSingleDayRange]
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
  const periodOptions = ANALYTICS_PERIOD_OPTIONS
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
  const selectedPeriodOption = useMemo(() => {
    return periodOptions.filter((option) => option.value === selectedPeriodValue)
  }, [periodOptions, selectedPeriodValue])
  const periodSummary = useMemo(
    () => buildAnalyticsPeriodSummary(selectedPeriodValue, activeRange),
    [activeRange, selectedPeriodValue]
  )
  const balancesTitle = isSingleDayRange
    ? "Saldo de horas do dia"
    : "Saldo de horas no periodo"
  const solicitationChartTitle = isSingleDayRange
    ? "Solicitacoes de ajuste do dia"
    : "Solicitacoes de ajuste no periodo"
  const workedHoursTitle = isSingleDayRange
    ? "Horas trabalhadas no dia"
    : "Horas trabalhadas no periodo"

  // Functions
  function handleCompanyFilterChange(selection: SelectionOption[]) {
    const nextCompanyId = selection[0]?.value

    if (!nextCompanyId) return

    setSelectedCompanyId(nextCompanyId)
  }

  function handlePeriodChange(selection: SelectionOption[]) {
    const nextPeriod = selection[0]?.value as AnalyticsPeriod | undefined

    if (!nextPeriod) return

    if (nextPeriod !== "custom") {
      const nextRange = resolveAnalyticsDateRange(nextPeriod)
      setCustomFrom(nextRange.from)
      setCustomTo(nextRange.to)
    }

    setSelectedPeriodValue(nextPeriod)
  }

  function handleCustomFromChange(value: string) {
    if (!value) return

    setCustomFrom(value)

    if (customTo && value > customTo) {
      setCustomTo(value)
    }
  }

  function handleCustomToChange(value: string) {
    if (!value) return

    setCustomTo(value)

    if (customFrom && value < customFrom) {
      setCustomFrom(value)
    }
  }

  return {
    balancesTitle,
    metrics,
    balances,
    customFrom,
    customTo,
    workedHours,
    errorMessage,
    isLoading: isDashboardLoading,
    isCompaniesLoading,
    companyOptions,
    periodOptions,
    periodSummary,
    isPlatformAdmin,
    solicitationChart,
    solicitationChartTitle,
    selectedCompanyOption,
    selectedPeriod: selectedPeriodValue,
    selectedPeriodOption,
    handleCompanyFilterChange,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
    workedHoursTitle,
  }
}
