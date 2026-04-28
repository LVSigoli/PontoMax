// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Services
import type { WorkdayApiItem } from "@/services/domain"
import { getTimeRecords, registerTimeRecord } from "@/services/domain"
import { formatHoursWithMinutes, formatMinutes } from "@/services/utils"

// Types
import type { PointRecord, WorkdaySummary } from "../types"

// Utils
import {
  formatPointDate,
  formatPointTime,
  getDateKeyFromValue,
  isBusinessDay,
  mapWorkdayToPointRecords,
  mapWorkdayToSummary,
  WORKDAY_TIMEZONE,
} from "../utils"

// Types
import type { AdjustmentRequestSidePanelMethods } from "../components/modals/AdjustmentRequestSidePanel/types"
import { ConfirmationModalMethods } from "../components/modals/ConfirmationModal/types"
import type { DayHistorySidePanelMethods } from "../components/modals/DayHistorySidePanel/types"

export function usePointRegister() {
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const confirmationModalRef = useRef<ConfirmationModalMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  const [now, setNow] = useState<Date | null>(null)
  const [workdays, setWorkdays] = useState<WorkdayApiItem[]>([])
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  const currentDate = now ? formatPointDate(now) : "--"
  const currentTime = now ? formatPointTime(now) : "--:--:--"
  const todayKey = useMemo(() => getDateKeyFromValue(now ?? new Date()), [now])

  const currentWorkday = useMemo(
    () =>
      workdays.find((workday) => getDateKeyFromValue(workday.date) === todayKey) ??
      null,
    [todayKey, workdays]
  )

  const currentRecords = useMemo(
    () => (currentWorkday ? mapWorkdayToPointRecords(currentWorkday) : []),
    [currentWorkday]
  )

  const historyRecords = useMemo(
    () => makeRecentBusinessSummaries(workdays, todayKey),
    [todayKey, workdays]
  )

  const workedHours = useMemo(
    () => formatHoursWithMinutes(currentWorkday?.workedMinutes ?? 0),
    [currentWorkday]
  )

  const balanceLabel = useMemo(() => {
    if (!currentWorkday) {
      return "Aguardando registros"
    }

    const balanceMinutes =
      currentWorkday.workedMinutes - currentWorkday.scheduledMinutes

    if (balanceMinutes >= 0) {
      return `Saldo positivo ${formatMinutes(balanceMinutes)}`
    }

    return `Faltam ${formatMinutes(Math.abs(balanceMinutes))}`
  }, [currentWorkday])

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
    void loadRecords()
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

  async function loadRecords() {
    const nextWorkdays = await getTimeRecords()
    setWorkdays(nextWorkdays)
  }

  async function handleRegisterPoint() {
    await registerTimeRecord({ timezone: WORKDAY_TIMEZONE })
    await loadRecords()
  }

  function handleConfirmationModalOpen() {
    confirmationModalRef.current?.open()
  }

  function handleHistoryRecordSelect(record: WorkdaySummary | null) {
    if (!record) return

    setSelectedHistoryRecord(record)
  }

  function handleAdjustmentRequestOpen(record: WorkdaySummary) {
    setSelectedHistoryRecord(record)
    setAdjustmentRequestRecords(record.records)
  }

  async function handleAdjustmentRequestSubmitted() {
    await loadRecords()
    setAdjustmentRequestRecords([])
  }

  return {
    historyRecords,
    currentDate,
    currentTime,
    workedHours,
    balanceLabel,
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

function makeRecentBusinessSummaries(
  workdays: WorkdayApiItem[],
  todayKey: string
) {
  return [...workdays]
    .filter((workday) => {
      const workdayKey = getDateKeyFromValue(workday.date)

      return workdayKey < todayKey && isBusinessDay(workday.date)
    })
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5)
    .map(mapWorkdayToSummary)
}
