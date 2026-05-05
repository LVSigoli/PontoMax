// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"
import { useSWRConfig } from "swr"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"
import { swrKeys, useTodayTimeRecordsSWR } from "@/hooks/swr"

// Services
import {
  getTimeRecordsOverview,
  registerTimeRecord,
  type WorkdayApiItem,
} from "@/services/domain"
import { formatHoursWithMinutes } from "@/services/utils"

// Types
import type { PointRecord, WorkdaySummary } from "../../types"
import type { AdjustmentRequestSidePanelMethods } from "../../components/modals/AdjustmentRequestSidePanel/types"
import { ConfirmationModalMethods } from "../../components/modals/ConfirmationModal/types"
import type { DayHistorySidePanelMethods } from "../../components/modals/DayHistorySidePanel/types"

// Utils
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  formatPointDate,
  formatPointTime,
  mapWorkdayToPointRecords,
  mapWorkdayToSummary,
  WORKDAY_TIMEZONE,
} from "../../utils"
import {
  buildBalanceLabel,
  calculateWorkedSeconds,
  formatDurationClock,
  POINT_REGISTER_HISTORY_PAGE_SIZE,
} from "./utils"

export function usePointRegister() {
  // Refs
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const confirmationModalRef = useRef<ConfirmationModalMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  // States
  const [now, setNow] = useState<Date | null>(null)
  const [overviewWorkdays, setOverviewWorkdays] = useState<WorkdayApiItem[]>([])
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentRequestWorkdayDate, setAdjustmentRequestWorkdayDate] =
    useState<string>()
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  // Contexts
  const { showToast } = useToastContext()
  const { mutate: mutateSWRCache } = useSWRConfig()
  const {
    data: currentWorkday = null,
    error: currentWorkdayError,
    mutate: mutateCurrentWorkday,
  } = useTodayTimeRecordsSWR()

  // Constants
  const currentDate = now ? formatPointDate(now) : "--"
  const currentTime = now ? formatPointTime(now) : "--:--:--"

  const currentRecords = useMemo(
    () => (currentWorkday ? mapWorkdayToPointRecords(currentWorkday) : []),
    [currentWorkday]
  )

  const historyRecords = useMemo(
    () => overviewWorkdays.map(mapWorkdayToSummary),
    [overviewWorkdays]
  )

  const scheduledMinutes = useMemo(
    () => currentWorkday?.scheduledMinutes ?? 0,
    [currentWorkday]
  )

  const remainingTime = useMemo(() => {
    const workedSeconds = currentWorkday
      ? calculateWorkedSeconds(currentWorkday.timeEntries, now ?? new Date())
      : 0

    const remainingSeconds = Math.max(0, scheduledMinutes * 60 - workedSeconds)

    return formatDurationClock(remainingSeconds)
  }, [currentWorkday, now, scheduledMinutes])

  const workedHours = useMemo(
    () => formatHoursWithMinutes(currentWorkday?.workedMinutes ?? 0),
    [currentWorkday]
  )

  const balanceLabel = useMemo(
    () => buildBalanceLabel(currentWorkday),
    [currentWorkday]
  )

  // Effects
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setNow(new Date())
    }, 0)

    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    void syncOverviewWorkdays()
  }, [])

  useEffect(() => {
    if (!currentWorkdayError) return

    showToast({
      variant: "error",
      message: getErrorMessage(
        currentWorkdayError,
        "Nao foi possivel carregar os dados do registro de ponto."
      ),
    })
  }, [currentWorkdayError, showToast])

  async function syncOverviewWorkdays() {
    try {
      const overviewResponse = await getTimeRecordsOverview({
        page: 1,
        pageSize: POINT_REGISTER_HISTORY_PAGE_SIZE,
      })

      setOverviewWorkdays(overviewResponse.items)
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel carregar os dados do registro de ponto."
        ),
      })
    }
  }

  async function handleRegisterPoint() {
    try {
      await registerTimeRecord({
        timezone: WORKDAY_TIMEZONE,
      })

      await Promise.all([
        mutateCurrentWorkday(),
        syncOverviewWorkdays(),
        mutateSWRCache(swrKeys.timeRecords.teamToday()),
      ])

      showToast({
        variant: "success",
        message: "Ponto registrado com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, "Nao foi possivel registrar o ponto."),
      })

      throw error
    }
  }

  function handleConfirmationModalOpen() {
    confirmationModalRef.current?.open()
  }

  function handleHistoryRecordSelect(record: WorkdaySummary | null) {
    if (!record) return

    setSelectedHistoryRecord(record)
    dayHistorySidePanelRef.current?.open()
  }

  function handleAdjustmentRequestOpen(record: WorkdaySummary) {
    setAdjustmentRequestWorkdayDate(record.workdayDate)
    setAdjustmentRequestRecords(record.records)
    adjustmentRequestSidePanelRef.current?.open()
  }

  async function handleAdjustmentRequestSubmitted() {
    try {
      await syncOverviewWorkdays()
      setAdjustmentRequestWorkdayDate(undefined)
      setAdjustmentRequestRecords([])
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel atualizar o historico de ponto."
        ),
      })
    }
  }

  return {
    historyRecords,
    currentDate,
    currentTime,
    remainingTime,
    workedHours,
    balanceLabel,
    adjustmentRequestWorkdayDate,
    currentRecords,
    adjustmentRequestRecords,
    selectedHistoryRecord,
    adjustmentRequestSidePanelRef,
    confirmationModalRef,
    dayHistorySidePanelRef,
    handleAdjustmentRequestOpen,
    handleAdjustmentRequestSubmitted,
    handleRegisterPoint,
    handleConfirmationModalOpen,
    handleHistoryRecordSelect,
  }
}
