import { useEffect, useMemo, useRef, useState } from "react"

import {
  getTimeRecordsOverview,
  getTimeRecordsSummary,
  type PaginationMeta,
  type WorkdayApiItem,
} from "@/services/domain"
import { formatMinutes, getErrorMessage } from "@/services/utils"

import type { AdjustmentRequestSidePanelMethods } from "@/components/pages/PointRegister/components/modals/AdjustmentRequestSidePanel/types"
import type { DayHistorySidePanelMethods } from "@/components/pages/PointRegister/components/modals/DayHistorySidePanel/types"
import type { PointRecord, WorkdaySummary } from "@/components/pages/PointRegister/types"
import { mapWorkdayToSummary } from "@/components/pages/PointRegister/utils"
import type { UserAnalysisItem } from "../types"

const HISTORY_PAGE_SIZE = 10

export function useHistory() {
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  const [analysisItems, setAnalysisItems] = useState<UserAnalysisItem[]>([])
  const [historyRecords, setHistoryRecords] = useState<WorkdayApiItem[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 0,
    pageSize: HISTORY_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  })
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentRequestWorkdayDate, setAdjustmentRequestWorkdayDate] =
    useState<string>()
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  const mappedHistoryRecords = useMemo(
    () => historyRecords.map(mapWorkdayToSummary),
    [historyRecords]
  )

  useEffect(() => {
    void loadInitialHistory()
  }, [])

  useEffect(() => {
    if (selectedHistoryRecord) {
      dayHistorySidePanelRef.current?.open()
    }
  }, [selectedHistoryRecord])

  useEffect(() => {
    if (adjustmentRequestRecords.length > 0) {
      adjustmentRequestSidePanelRef.current?.open()
    }
  }, [adjustmentRequestRecords])

  async function loadInitialHistory() {
    try {
      setErrorMessage("")
      setIsLoadingMore(true)

      const [overview, summary] = await Promise.all([
        getTimeRecordsOverview({
          page: 1,
          pageSize: HISTORY_PAGE_SIZE,
        }),
        getTimeRecordsSummary(),
      ])

      setPagination(overview.meta)
      setHistoryRecords(overview.items)
      setHasMore(overview.meta.page < overview.meta.totalPages)
      setAnalysisItems([
        {
          label: "Dias trabalhados",
          data: `${summary.workedDays} dias`,
          type: "worked-days",
          subtitle: "Quantidade de dias trabalhados no periodo carregado",
        },
        {
          label: "Saldo de horas",
          data: formatMinutes(summary.balanceMinutes),
          type: "hour-balance",
          subtitle: "Total acumulado de horas extras e faltas",
        },
        {
          label: "Ajustes pendentes",
          data: `${summary.pendingAdjustments} solicitacoes`,
          type: "pending",
          subtitle: "Solicitacoes de correcao aguardando aprovacao",
        },
        {
          label: "Inconsistencias",
          data: `${summary.inconsistentCount} registros`,
          type: "issues",
          subtitle: "Casos com falta de registros ou jornadas incompletas",
        },
      ])
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel carregar o historico.")
      )
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
        pageSize: HISTORY_PAGE_SIZE,
      })

      setPagination(overview.meta)
      setHistoryRecords((current) => {
        const nextRecords = [...current]
        const existingIds = new Set(current.map((record) => record.id))

        for (const item of overview.items) {
          if (!existingIds.has(item.id)) {
            nextRecords.push(item)
          }
        }

        return nextRecords
      })
      setHasMore(overview.meta.page < overview.meta.totalPages)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel carregar mais historico.")
      )
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function refreshLoadedHistory() {
    if (pagination.page <= 0) {
      await loadInitialHistory()
      return
    }

    try {
      setErrorMessage("")

      const requests = Array.from({ length: pagination.page }, (_, index) =>
        getTimeRecordsOverview({
          page: index + 1,
          pageSize: HISTORY_PAGE_SIZE,
        })
      )

      const [pages, summary] = await Promise.all([
        Promise.all(requests),
        getTimeRecordsSummary(),
      ])
      const latestPage = pages.at(-1)

      if (!latestPage) {
        return
      }

      setPagination(latestPage.meta)
      setHistoryRecords(pages.flatMap((page) => page.items))
      setHasMore(latestPage.meta.page < latestPage.meta.totalPages)
      setAnalysisItems([
        {
          label: "Dias trabalhados",
          data: `${summary.workedDays} dias`,
          type: "worked-days",
          subtitle: "Quantidade de dias trabalhados no periodo carregado",
        },
        {
          label: "Saldo de horas",
          data: formatMinutes(summary.balanceMinutes),
          type: "hour-balance",
          subtitle: "Total acumulado de horas extras e faltas",
        },
        {
          label: "Ajustes pendentes",
          data: `${summary.pendingAdjustments} solicitacoes`,
          type: "pending",
          subtitle: "Solicitacoes de correcao aguardando aprovacao",
        },
        {
          label: "Inconsistencias",
          data: `${summary.inconsistentCount} registros`,
          type: "issues",
          subtitle: "Casos com falta de registros ou jornadas incompletas",
        },
      ])
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel atualizar o historico.")
      )
    }
  }

  function handleHistoryRecordSelect(record: WorkdaySummary | null) {
    if (!record) return

    setSelectedHistoryRecord(record)
  }

  function handleAdjustmentRequestOpen(record: WorkdaySummary) {
    setSelectedHistoryRecord(record)
    setAdjustmentRequestWorkdayDate(record.workdayDate)
    setAdjustmentRequestRecords(record.records)
  }

  async function handleAdjustmentRequestSubmitted() {
    await refreshLoadedHistory()
    setAdjustmentRequestWorkdayDate(undefined)
    setAdjustmentRequestRecords([])
  }

  return {
    analysisItems,
    errorMessage,
    historyRecords: mappedHistoryRecords,
    isInitialLoading,
    isLoadingMore,
    hasMore,
    selectedHistoryRecord,
    adjustmentRequestWorkdayDate,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    dayHistorySidePanelRef,
    loadMoreHistory,
    handleHistoryRecordSelect,
    handleAdjustmentRequestOpen,
    handleAdjustmentRequestSubmitted,
  }
}
