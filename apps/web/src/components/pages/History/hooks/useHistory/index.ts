// External Libraries
import { useRef, useState } from "react"

// Hooks
import { useHistoryTable } from "../useHistoryTable"

//  Utils
import { POINT_HISTORY_ACTIONS } from "./utils"

// Types
import type { AdjustmentRequestSidePanelMethods } from "@/components/pages/PointRegister/components/modals/AdjustmentRequestSidePanel/types"
import type { DayHistorySidePanelMethods } from "@/components/pages/PointRegister/components/modals/DayHistorySidePanel/types"
import type {
  PointRecord,
  WorkdaySummary,
} from "@/components/pages/PointRegister/types"
import type { TableRowData } from "@/components/structure/Table/types"

export function useHistory() {
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

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
  } = useHistoryTable()

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

  async function handleAdjustmentRequestSubmitted() {
    await refreshLoadedHistory()
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
  }

  return {
    hasMore,
    errorMessage,
    tableData,
    getRowKey,
    loadMoreRef,
    loadMoreLabel,
    tableActions: POINT_HISTORY_ACTIONS,
    isLoadingMore,
    analysisItems,
    isInitialLoading,
    selectedHistoryRecord,
    adjustmentWorkdayDate,
    dayHistorySidePanelRef,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    historyRecords,
    handleHistoryActionClick,
    handleHistoryRecordSelect,
    handleAdjustmentRequestSubmitted,
  }
}
