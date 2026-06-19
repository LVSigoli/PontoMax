import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useTimeRecordsSummarySWR } from "@/hooks/swr"
import { mapWorkdayToSummary } from "@/components/pages/PointRegister/utils"
import type { WorkdaySummary } from "@/components/pages/PointRegister/types"
import type { TableRowData } from "@/components/structure/Table/types"
import { useToastContext } from "@/contexts/ToastContext"
import { getTimeRecordsOverview, type WorkdayApiItem } from "@/services/domain"
import { getErrorMessage } from "@/utils/getErrorMessage"

import type { UserAnalysisItem } from "../../types"
import {
  buildAnalysisItems,
  buildHistoryRecords,
  buildLoadMoreLabel,
  buildTableData,
  makeInitialPagination,
  PAGE_SIZE,
} from "./utils"

const LOAD_HISTORY_ERROR_MESSAGE =
  "Nao foi possivel carregar o historico de ponto."

interface DateRange {
  from: string
  to: string
}

export function useHistoryTable(userId: number | null, range: DateRange) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const activeRequestKeyRef = useRef("")

  const [hasMore, setHasMore] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [historyRecords, setHistoryRecords] = useState<WorkdayApiItem[]>([])
  const [pagination, setPagination] = useState(makeInitialPagination)

  const { showToast } = useToastContext()
  const {
    data: summary,
    error: summaryError,
    mutate: mutateSummary,
  } = useTimeRecordsSummarySWR(
    {
      userId: userId ?? undefined,
      from: range.from,
      to: range.to,
    },
    {
      enabled: userId !== null,
    }
  )

  const analysisItems = useMemo<UserAnalysisItem[]>(
    () => (summary ? buildAnalysisItems(summary) : []),
    [summary]
  )

  const mappedHistoryRecords = useMemo(
    () => historyRecords.map(mapWorkdayToSummary),
    [historyRecords]
  )

  const tableData = useMemo(
    () => buildTableData(mappedHistoryRecords),
    [mappedHistoryRecords]
  )

  const loadMoreLabel = useMemo(
    () =>
      buildLoadMoreLabel({
        hasMore,
        isInitialLoading,
        isLoadingMore,
      }),
    [hasMore, isInitialLoading, isLoadingMore]
  )

  const loadInitialHistory = useCallback(async () => {
    const scopeRequestKey = `${userId ?? "none"}:${range.from}:${range.to}`

    if (userId === null) {
      setErrorMessage("")
      setHasMore(false)
      setIsInitialLoading(false)
      setIsLoadingMore(false)
      setPagination(makeInitialPagination())
      setHistoryRecords([])
      return
    }

    try {
      setErrorMessage("")
      setIsInitialLoading(true)
      setIsLoadingMore(false)
      setHasMore(true)
      setPagination(makeInitialPagination())
      setHistoryRecords([])

      const [overview] = await Promise.all([
        getTimeRecordsOverview({
          from: range.from,
          to: range.to,
          page: 1,
          pageSize: PAGE_SIZE,
          userId,
        }),
        mutateSummary(),
      ])

      if (activeRequestKeyRef.current !== scopeRequestKey) return

      setHasMore(overview.meta.page < overview.meta.totalPages)
      setPagination(overview.meta)
      setHistoryRecords(overview.items)
    } catch (error) {
      if (activeRequestKeyRef.current !== scopeRequestKey) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })
    } finally {
      if (activeRequestKeyRef.current !== scopeRequestKey) return

      setIsInitialLoading(false)
      setIsLoadingMore(false)
    }
  }, [mutateSummary, range.from, range.to, showToast, userId])

  const loadMoreHistory = useCallback(async () => {
    if (
      userId === null ||
      isInitialLoading ||
      isLoadingMore ||
      !hasMore ||
      pagination.page <= 0
    ) {
      return
    }

    const scopeRequestKey = `${userId}:${range.from}:${range.to}`
    const nextPage = pagination.page + 1

    try {
      setErrorMessage("")
      setIsLoadingMore(true)

      const overview = await getTimeRecordsOverview({
        from: range.from,
        to: range.to,
        page: nextPage,
        pageSize: PAGE_SIZE,
        userId,
      })

      if (activeRequestKeyRef.current !== scopeRequestKey) return

      setHasMore(overview.meta.page < overview.meta.totalPages)
      setPagination(overview.meta)
      setHistoryRecords((current) => buildHistoryRecords(current, overview))
    } catch (error) {
      if (activeRequestKeyRef.current !== scopeRequestKey) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })
    } finally {
      if (activeRequestKeyRef.current !== scopeRequestKey) return

      setIsLoadingMore(false)
    }
  }, [
    hasMore,
    isInitialLoading,
    isLoadingMore,
    pagination.page,
    range.from,
    range.to,
    showToast,
    userId,
  ])

  const refreshLoadedHistory = useCallback(async () => {
    if (userId === null) {
      await loadInitialHistory()
      return
    }

    if (pagination.page <= 0) {
      await loadInitialHistory()
      return
    }

    const scopeRequestKey = `${userId}:${range.from}:${range.to}`

    try {
      setErrorMessage("")

      const overviewRequests = Array.from(
        { length: pagination.page },
        (_, index) =>
          getTimeRecordsOverview({
            from: range.from,
            to: range.to,
            page: index + 1,
            pageSize: PAGE_SIZE,
            userId,
          })
      )

      const [pages] = await Promise.all([
        Promise.all(overviewRequests),
        mutateSummary(),
      ])

      if (activeRequestKeyRef.current !== scopeRequestKey) return

      const latestPage = pages.at(-1)

      if (!latestPage) return

      setHasMore(latestPage.meta.page < latestPage.meta.totalPages)
      setPagination(latestPage.meta)
      setHistoryRecords(pages.flatMap((page) => page.items))
    } catch (error) {
      if (activeRequestKeyRef.current !== scopeRequestKey) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })

      throw error
    }
  }, [
    loadInitialHistory,
    mutateSummary,
    pagination.page,
    range.from,
    range.to,
    showToast,
    userId,
  ])

  useEffect(() => {
    activeRequestKeyRef.current = `${userId ?? "none"}:${range.from}:${range.to}`
  }, [range.from, range.to, userId])

  useEffect(() => {
    void loadInitialHistory()
  }, [loadInitialHistory])

  useEffect(() => {
    if (!summaryError) return

    const message = getErrorMessage(summaryError, LOAD_HISTORY_ERROR_MESSAGE)

    setErrorMessage(message)
    showToast({
      variant: "error",
      message,
    })
  }, [showToast, summaryError])

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreHistory()
        }
      },
      {
        root: null,
        rootMargin: "160px 0px",
        threshold: 0,
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [loadMoreHistory])

  function getHistoryRecordByRow(row: TableRowData): WorkdaySummary | null {
    const rowIndex = tableData.indexOf(row)
    return mappedHistoryRecords[rowIndex] ?? null
  }

  function getRowKey(_: TableRowData, index: number) {
    return mappedHistoryRecords[index]?.id ?? index
  }

  function markWorkdayPending(workdayId: number) {
    setHistoryRecords((current) =>
      current.map((workday) =>
        workday.id === workdayId
          ? {
              ...workday,
              status: "PENDING_ADJUSTMENT",
            }
          : workday
      )
    )
  }

  return {
    hasMore,
    errorMessage,
    tableData,
    loadMoreRef,
    loadMoreLabel,
    analysisItems,
    isLoadingMore,
    isInitialLoading,
    historyRecords: mappedHistoryRecords,
    getRowKey,
    getHistoryRecordByRow,
    markWorkdayPending,
    refreshLoadedHistory,
  }
}
