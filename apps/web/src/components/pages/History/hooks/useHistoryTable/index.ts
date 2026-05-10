import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useTimeRecordsSummarySWR } from "@/hooks/swr"
import { mapWorkdayToSummary } from "@/components/pages/PointRegister/utils"
import type { WorkdaySummary } from "@/components/pages/PointRegister/types"
import type { TableRowData } from "@/components/structure/Table/types"
import { useToastContext } from "@/contexts/ToastContext"
import {
  getTimeRecordsOverview,
  type WorkdayApiItem,
} from "@/services/domain"
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

export function useHistoryTable(userId: number) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const selectedUserIdRef = useRef(userId)

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
  } = useTimeRecordsSummarySWR({ userId })

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
    const scopeUserId = userId

    try {
      setErrorMessage("")
      setIsInitialLoading(true)
      setIsLoadingMore(false)
      setHasMore(true)
      setPagination(makeInitialPagination())
      setHistoryRecords([])

      const [overview] = await Promise.all([
        getTimeRecordsOverview({
          page: 1,
          pageSize: PAGE_SIZE,
          userId: scopeUserId,
        }),
        mutateSummary(),
      ])

      if (selectedUserIdRef.current !== scopeUserId) return

      setHasMore(overview.meta.page < overview.meta.totalPages)
      setPagination(overview.meta)
      setHistoryRecords(overview.items)
    } catch (error) {
      if (selectedUserIdRef.current !== scopeUserId) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })
    } finally {
      if (selectedUserIdRef.current !== scopeUserId) return

      setIsInitialLoading(false)
      setIsLoadingMore(false)
    }
  }, [mutateSummary, showToast, userId])

  const loadMoreHistory = useCallback(async () => {
    if (isInitialLoading || isLoadingMore || !hasMore || pagination.page <= 0) {
      return
    }

    const scopeUserId = userId
    const nextPage = pagination.page + 1

    try {
      setErrorMessage("")
      setIsLoadingMore(true)

      const overview = await getTimeRecordsOverview({
        page: nextPage,
        pageSize: PAGE_SIZE,
        userId: scopeUserId,
      })

      if (selectedUserIdRef.current !== scopeUserId) return

      setHasMore(overview.meta.page < overview.meta.totalPages)
      setPagination(overview.meta)
      setHistoryRecords((current) => buildHistoryRecords(current, overview))
    } catch (error) {
      if (selectedUserIdRef.current !== scopeUserId) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })
    } finally {
      if (selectedUserIdRef.current !== scopeUserId) return

      setIsLoadingMore(false)
    }
  }, [hasMore, isInitialLoading, isLoadingMore, pagination.page, showToast, userId])

  const refreshLoadedHistory = useCallback(async () => {
    if (pagination.page <= 0) {
      await loadInitialHistory()
      return
    }

    const scopeUserId = userId

    try {
      setErrorMessage("")

      const overviewRequests = Array.from(
        { length: pagination.page },
        (_, index) =>
          getTimeRecordsOverview({
            page: index + 1,
            pageSize: PAGE_SIZE,
            userId: scopeUserId,
          })
      )

      const [pages] = await Promise.all([
        Promise.all(overviewRequests),
        mutateSummary(),
      ])

      if (selectedUserIdRef.current !== scopeUserId) return

      const latestPage = pages.at(-1)

      if (!latestPage) return

      setHasMore(latestPage.meta.page < latestPage.meta.totalPages)
      setPagination(latestPage.meta)
      setHistoryRecords(pages.flatMap((page) => page.items))
    } catch (error) {
      if (selectedUserIdRef.current !== scopeUserId) return

      const message = getErrorMessage(error, LOAD_HISTORY_ERROR_MESSAGE)

      setErrorMessage(message)
      showToast({
        variant: "error",
        message,
      })

      throw error
    }
  }, [loadInitialHistory, mutateSummary, pagination.page, showToast, userId])

  useEffect(() => {
    selectedUserIdRef.current = userId
  }, [userId])

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
    refreshLoadedHistory,
  }
}
