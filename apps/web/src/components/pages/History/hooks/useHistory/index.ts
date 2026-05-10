// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Hooks
import { useUsersSWR } from "@/hooks/swr"

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

export function useHistory() {
  const { user } = useAuth()

  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  const canFilterHistory =
    user?.role === "PLATFORM_ADMIN" || user?.role === "COMPANY_ADMIN"
  const [selectedUserId, setSelectedUserId] = useState(
    Number(user?.id ?? 0)
  )

  const { data: companyUsers = [] } = useUsersSWR(
    { companyId: user?.companyId },
    {
      enabled: canFilterHistory && Boolean(user?.companyId),
    }
  )

  const historyUserOptions = useMemo<SelectionOption[]>(() => {
    if (!user) return []

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
        label: buildHistoryUserLabel(companyUser),
      }))

    return [selfOption, ...otherUsers]
  }, [canFilterHistory, companyUsers, user])

  const selectedHistoryUserOption = useMemo<SelectionOption[]>(() => {
    return historyUserOptions.filter(
      (option) => option.value === String(selectedUserId)
    )
  }, [historyUserOptions, selectedUserId])

  const historySubtitle = canFilterHistory
    ? "Escolha um colaborador da empresa para visualizar o historico."
    : "Acompanhe seus registros e ajustes anteriores."

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
  } = useHistoryTable(selectedUserId)

  useEffect(() => {
    if (!user) return

    if (!canFilterHistory) {
      setSelectedUserId(Number(user.id))
      return
    }

    const hasSelectedUser = historyUserOptions.some(
      (option) => option.value === String(selectedUserId)
    )

    if (!hasSelectedUser) {
      setSelectedUserId(Number(user.id))
    }
  }, [canFilterHistory, historyUserOptions, selectedUserId, user])

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
    setSelectedHistoryRecord(null)
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
    dayHistorySidePanelRef.current?.close()
    adjustmentRequestSidePanelRef.current?.close()
  }

  async function handleAdjustmentRequestSubmitted() {
    await refreshLoadedHistory()
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
  }

  return {
    canFilterHistory,
    errorMessage,
    historySubtitle,
    historyUserOptions,
    selectedHistoryUserOption,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    adjustmentWorkdayDate,
    analysisItems,
    dayHistorySidePanelRef,
    getRowKey,
    handleAdjustmentRequestSubmitted,
    handleHistoryActionClick,
    handleHistoryRecordSelect,
    handleHistoryUserChange,
    hasMore,
    historyRecords,
    isInitialLoading,
    isLoadingMore,
    loadMoreLabel,
    loadMoreRef,
    selectedHistoryRecord,
    tableData,
    tableActions: POINT_HISTORY_ACTIONS,
  }
}

function buildHistoryUserLabel(user: UserApiItem) {
  if (user.position?.trim()) {
    return `${user.fullName} - ${user.position.trim()}`
  }

  return user.fullName
}
