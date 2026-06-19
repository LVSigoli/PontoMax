// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Hooks
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter"
import { useCompaniesSWR, useUsersSWR } from "@/hooks/swr"

// Hooks
import { useHistoryTable } from "../useHistoryTable"

// Utils
import { POINT_HISTORY_ACTIONS } from "./utils"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { AdjustmentRequestSidePanelMethods } from "@/components/pages/PointRegister/components/modals/AdjustmentRequestSidePanel/types"
import type { DayHistorySidePanelMethods } from "@/components/pages/PointRegister/components/modals/DayHistorySidePanel/types"
import type {
  PointRecord,
  WorkdaySummary,
} from "@/components/pages/PointRegister/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { UserApiItem } from "@/services/domain"
import { addDays, buildDateInputValue } from "@/utils/dateRangeFilter"

const ALL_OPTION_VALUE = "__all__"

export function useHistory() {
  const { user } = useAuth()

  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  const canFilterHistory =
    user?.role === "PLATFORM_ADMIN" || user?.role === "COMPANY_ADMIN"
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    user ? Number(user.id) : null
  )
  const [selectedCompanyValue, setSelectedCompanyValue] =
    useState(ALL_OPTION_VALUE)
  const historyReferenceDate = useMemo(() => addDays(new Date(), -1), [])
  const maxHistoryDate = useMemo(
    () => buildDateInputValue(historyReferenceDate),
    [historyReferenceDate]
  )
  const {
    activeRange,
    customFrom,
    customTo,
    isCustomPeriod,
    periodOptions,
    periodSummary,
    selectedPeriodOption,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
  } = useDateRangeFilter({
    defaultPreset: "last30Days",
    referenceDate: historyReferenceDate,
    maxDate: maxHistoryDate,
  })
  const selectedCompanyId = useMemo(() => {
    if (!isPlatformAdmin || selectedCompanyValue === ALL_OPTION_VALUE) {
      return undefined
    }

    return Number(selectedCompanyValue)
  }, [isPlatformAdmin, selectedCompanyValue])
  const { data: companies = [], isLoading: isCompaniesLoading } =
    useCompaniesSWR({
      enabled: isPlatformAdmin,
    })
  const userCompanyScope = isPlatformAdmin ? selectedCompanyId : user?.companyId

  const { data: companyUsers = [], isLoading: isUsersLoading } = useUsersSWR(
    { companyId: userCompanyScope },
    {
      enabled:
        canFilterHistory && (isPlatformAdmin || Boolean(user?.companyId)),
    }
  )
  const companyOptions = useMemo<SelectionOption[]>(() => {
    if (!isPlatformAdmin) return []

    return [
      { value: ALL_OPTION_VALUE, label: "Todas as empresas" },
      ...companies.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    ]
  }, [companies, isPlatformAdmin])
  const selectedCompanyOption = useMemo<SelectionOption[]>(() => {
    return companyOptions.filter(
      (option) => option.value === selectedCompanyValue
    )
  }, [companyOptions, selectedCompanyValue])

  const historyUserOptions = useMemo<SelectionOption[]>(() => {
    if (!user) return []

    const shouldIncludeSelfOption =
      !canFilterHistory ||
      !isPlatformAdmin ||
      selectedCompanyId === undefined ||
      user.companyId === selectedCompanyId
    const selfOption: SelectionOption = {
      value: String(user.id),
      label: "Meus registros",
    }

    if (!canFilterHistory) {
      return [selfOption]
    }

    const otherUsers = companyUsers
      .filter((companyUser) => String(companyUser.id) !== user.id)
      .sort((left, right) =>
        left.fullName.localeCompare(right.fullName, "pt-BR")
      )
      .map<SelectionOption>((companyUser) => ({
        value: String(companyUser.id),
        label: buildHistoryUserLabel(companyUser, isPlatformAdmin),
      }))

    return shouldIncludeSelfOption ? [selfOption, ...otherUsers] : otherUsers
  }, [canFilterHistory, companyUsers, isPlatformAdmin, selectedCompanyId, user])

  const selectedHistoryUserOption = useMemo<SelectionOption[]>(() => {
    if (selectedUserId === null) return []

    return historyUserOptions.filter(
      (option) => option.value === String(selectedUserId)
    )
  }, [historyUserOptions, selectedUserId])

  const historySubtitle = canFilterHistory
    ? isPlatformAdmin
      ? "Escolha uma empresa, selecione o colaborador e ajuste o periodo para visualizar o historico."
      : "Escolha um colaborador e ajuste o periodo para visualizar o historico."
    : "Acompanhe seus registros e ajustes anteriores por periodo."

  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentWorkdayDate, setAdjustmentWorkdayDate] = useState("")
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  const {
    hasMore,
    errorMessage,
    tableData,
    loadMoreRef,
    loadMoreLabel,
    analysisItems,
    isLoadingMore,
    isInitialLoading,
    historyRecords,
    getRowKey,
    getHistoryRecordByRow,
    refreshLoadedHistory,
  } = useHistoryTable(selectedUserId, activeRange)

  useEffect(() => {
    if (!user) return

    if (!canFilterHistory) {
      const ownUserId = Number(user.id)

      if (selectedUserId !== ownUserId) {
        setSelectedUserId(ownUserId)
      }

      return
    }

    const hasSelectedUser =
      selectedUserId !== null &&
      historyUserOptions.some(
        (option) => option.value === String(selectedUserId)
      )

    if (hasSelectedUser) return

    const fallbackUserId = Number(historyUserOptions[0]?.value)

    if (fallbackUserId > 0) {
      setSelectedUserId(fallbackUserId)
      resetHistorySelection()
      return
    }

    if (selectedUserId !== null) {
      setSelectedUserId(null)
      resetHistorySelection()
    }
  }, [canFilterHistory, historyUserOptions, selectedUserId, user])

  function resetHistorySelection() {
    setSelectedHistoryRecord(null)
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
    dayHistorySidePanelRef.current?.close()
    adjustmentRequestSidePanelRef.current?.close()
  }

  function handleHistoryRecordSelect(row: TableRowData) {
    const record = getHistoryRecordByRow(row)

    if (!record) return

    setSelectedHistoryRecord(record)
    dayHistorySidePanelRef.current?.open()
  }

  function handleAdjustmentRequestOpen(record: WorkdaySummary) {
    setAdjustmentWorkdayDate(record.workdayDate)
    setAdjustmentRequestRecords(record.records)
    adjustmentRequestSidePanelRef.current?.open()
  }

  function handleHistoryActionClick(actionId: string, row: TableRowData) {
    const record = getHistoryRecordByRow(row)

    if (actionId === "request-adjustment" && record) {
      handleAdjustmentRequestOpen(record)
    }
  }

  function handleHistoryUserChange(selection: SelectionOption[]) {
    const nextUser = selection[0]

    if (!nextUser) return

    setSelectedUserId(Number(nextUser.value))
    resetHistorySelection()
  }

  function handleHistoryCompanyChange(selection: SelectionOption[]) {
    const nextCompany = selection[0]

    if (!nextCompany) return

    setSelectedCompanyValue(nextCompany.value)
    resetHistorySelection()
  }

  async function handleAdjustmentRequestSubmitted() {
    await refreshLoadedHistory()
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
  }

  return {
    canFilterHistory,
    companyOptions,
    customFrom,
    customTo,
    errorMessage,
    historySubtitle,
    historyUserOptions,
    isCompaniesLoading,
    isCustomPeriod,
    isPlatformAdmin,
    periodOptions,
    periodSummary,
    selectedCompanyOption,
    selectedHistoryUserOption,
    selectedPeriodOption,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    adjustmentWorkdayDate,
    analysisItems,
    dayHistorySidePanelRef,
    getRowKey,
    handleAdjustmentRequestSubmitted,
    handleCustomFromChange,
    handleCustomToChange,
    handleHistoryActionClick,
    handleHistoryCompanyChange,
    handleHistoryRecordSelect,
    handleHistoryUserChange,
    handlePeriodChange,
    hasMore,
    historyRecords,
    isInitialLoading,
    isLoadingMore,
    isUsersLoading,
    loadMoreLabel,
    loadMoreRef,
    selectedHistoryRecord,
    selectedHistoryUserId: selectedUserId ?? undefined,
    tableData,
    tableActions: POINT_HISTORY_ACTIONS,
  }
}

function buildHistoryUserLabel(user: UserApiItem, includeCompanyName = false) {
  const parts = [user.fullName]

  if (user.position?.trim()) {
    parts.push(user.position.trim())
  }

  if (includeCompanyName && user.companyName?.trim()) {
    parts.push(user.companyName.trim())
  }

  return parts.join(" - ")
}
