// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Services
import {
  getTimeRecordsOverview,
  getTimeRecordsSummary,
  type WorkdayApiItem,
} from "@/services/domain"

// Utils
import { mapWorkdayToSummary } from "@/components/pages/PointRegister/utils"
import {
  buildAnalysissItems,
  buildHistoryRecords,
  makeInitialPagination,
  PAGE_SIZE,
} from "./utils"

// Types
import type { AdjustmentRequestSidePanelMethods } from "@/components/pages/PointRegister/components/modals/AdjustmentRequestSidePanel/types"
import type { DayHistorySidePanelMethods } from "@/components/pages/PointRegister/components/modals/DayHistorySidePanel/types"
import type {
  PointRecord,
  WorkdaySummary,
} from "@/components/pages/PointRegister/types"
import type { UserAnalysisItem } from "../../types"

export function useHistory() {
  // Refs
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  // States
  const [hasMore, setHasMore] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [pagination, setPagination] = useState(makeInitialPagination)
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentWorkdayDate, setAdjustmentWorkdayDate] = useState("")
  const [historyRecords, setHistoryRecords] = useState<WorkdayApiItem[]>([])
  const [analysisItems, setAnalysisItems] = useState<UserAnalysisItem[]>([])
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  // Constants
  const mappedHistoryRecords = useMemo(
    () => historyRecords.map(mapWorkdayToSummary),
    [historyRecords]
  )

  // Effects
  useEffect(() => {
    void loadInitialHistory()
  }, [])

  useEffect(() => {
    if (!selectedHistoryRecord) return
    dayHistorySidePanelRef.current?.open()
  }, [selectedHistoryRecord])

  useEffect(() => {
    if (!adjustmentRequestRecords.length) return

    adjustmentRequestSidePanelRef.current?.open()
  }, [adjustmentRequestRecords])

  // Functions
  async function loadInitialHistory() {
    try {
      setErrorMessage("")
      setIsLoadingMore(true)

      const [overview, summary] = await Promise.all([
        getTimeRecordsOverview({ page: 1, pageSize: PAGE_SIZE }),
        getTimeRecordsSummary(),
      ])

      const summaryItems = buildAnalysissItems(summary)
      const isEndReached = overview.meta.page < overview.meta.totalPages

      setHasMore(isEndReached)
      setPagination(overview.meta)
      setAnalysisItems(summaryItems)
      setHistoryRecords(overview.items)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingMore(false)
      setIsInitialLoading(false)
    }
  }

  async function loadMoreHistory() {
    if (isInitialLoading || isLoadingMore || !hasMore || pagination.page <= 0) {
      return
    }

    const nextPage = pagination.page + 1

    try {
      setIsLoadingMore(true)
      setErrorMessage("")

      const overview = await getTimeRecordsOverview({
        page: nextPage,
        pageSize: PAGE_SIZE,
      })

      const isEndReached = overview.meta.page < overview.meta.totalPages

      setHasMore(isEndReached)
      setPagination(overview.meta)
      setHistoryRecords((current) => buildHistoryRecords(current, overview))
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function refreshLoadedHistory() {
    if (pagination.page <= 0) return await loadInitialHistory()

    try {
      setErrorMessage("")

      const requests = Array.from({ length: pagination.page }, (_, index) =>
        getTimeRecordsOverview({ page: index + 1, pageSize: PAGE_SIZE })
      )

      const [pages, summary] = await Promise.all([
        Promise.all(requests),
        getTimeRecordsSummary(),
      ])

      const latestPage = pages.at(-1)

      if (!latestPage) return

      const summaryItems = buildAnalysissItems(summary)
      const isEndReached = latestPage.meta.page < latestPage.meta.totalPages

      setHasMore(isEndReached)
      setAnalysisItems(summaryItems)

      setPagination(latestPage.meta)

      setHistoryRecords(pages.flatMap((page) => page.items))
    } catch (error) {
      console.log(error)
    }
  }

  function handleHistoryRecordSelect(record: WorkdaySummary | null) {
    if (!record) return

    setSelectedHistoryRecord(record)
  }

  function handleAdjustmentRequestOpen(record: WorkdaySummary) {
    setAdjustmentWorkdayDate(record.workdayDate)
    setAdjustmentRequestRecords(record.records)
  }

  async function handleAdjustmentRequestSubmitted() {
    await refreshLoadedHistory()
    setAdjustmentWorkdayDate("")
    setAdjustmentRequestRecords([])
  }

  return {
    hasMore,
    errorMessage,
    isLoadingMore,
    analysisItems,
    isInitialLoading,
    selectedHistoryRecord,
    adjustmentWorkdayDate,
    dayHistorySidePanelRef,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    historyRecords: mappedHistoryRecords,
    loadMoreHistory,
    handleHistoryRecordSelect,
    handleAdjustmentRequestOpen,
    handleAdjustmentRequestSubmitted,
  }
}
