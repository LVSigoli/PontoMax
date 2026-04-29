// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Services
import type { WorkdayApiItem } from "@/services/domain"
import {
  getTimeRecordsOverview,
  getTodayTimeRecords,
  registerTimeRecord,
} from "@/services/domain"
import { formatHoursWithMinutes, formatMinutes } from "@/services/utils"

// Types
import type { PointRecord, WorkdaySummary } from "../types"

// Utils
import {
  formatPointDate,
  formatPointTime,
  mapWorkdayToPointRecords,
  mapWorkdayToSummary,
  WORKDAY_TIMEZONE,
} from "../utils"

// Types
import type { AdjustmentRequestSidePanelMethods } from "../components/modals/AdjustmentRequestSidePanel/types"
import { ConfirmationModalMethods } from "../components/modals/ConfirmationModal/types"
import type { DayHistorySidePanelMethods } from "../components/modals/DayHistorySidePanel/types"

const POINT_REGISTER_HISTORY_PAGE_SIZE = 6

export function usePointRegister() {
  //Refs
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const confirmationModalRef = useRef<ConfirmationModalMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  // States
  const [now, setNow] = useState<Date | null>(null)
  const [currentWorkday, setCurrentWorkday] = useState<WorkdayApiItem | null>(
    null
  )
  const [overviewWorkdays, setOverviewWorkdays] = useState<WorkdayApiItem[]>([])
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<WorkdaySummary | null>(null)
  const [adjustmentRequestWorkdayDate, setAdjustmentRequestWorkdayDate] =
    useState<string>()
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

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

  const balanceLabel = useMemo(() => {
    if (!currentWorkday || currentWorkday.timeEntries.length === 0) {
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
    void loadPointRegisterData()
  }, [])

  // useEffect(() => {
  //   if (selectedHistoryRecord)
  // }, [selectedHistoryRecord])

  useEffect(() => {
    if (adjustmentRequestRecords.length > 0) {
    }
  }, [adjustmentRequestRecords])

  // Functions
  async function loadPointRegisterData() {
    try {
      const [nextCurrentWorkday, overviewResponse] = await Promise.all([
        getTodayTimeRecords(),
        getTimeRecordsOverview({
          page: 1,
          pageSize: POINT_REGISTER_HISTORY_PAGE_SIZE,
        }),
      ])

      setCurrentWorkday(nextCurrentWorkday)
      setOverviewWorkdays(overviewResponse.items)
    } catch (e) {
      console.log(e)
    }
  }

  async function loadCurrentWorkday() {
    try {
      const nextCurrentWorkday = await getTodayTimeRecords()
      setCurrentWorkday(nextCurrentWorkday)
    } catch (e) {
      console.log(e)
    }
  }

  async function loadOverviewWorkdays() {
    try {
      const overviewResponse = await getTimeRecordsOverview({
        page: 1,
        pageSize: POINT_REGISTER_HISTORY_PAGE_SIZE,
      })
      setOverviewWorkdays(overviewResponse.items)
    } catch (e) {
      console.log(e)
    }
  }

  async function handleRegisterPoint() {
    try {
      await registerTimeRecord({ timezone: WORKDAY_TIMEZONE })
      await loadCurrentWorkday()
    } catch (e) {
      console.log(e)
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
    await loadOverviewWorkdays()
    setAdjustmentRequestWorkdayDate(undefined)
    setAdjustmentRequestRecords([])
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

function calculateWorkedSeconds(
  entries: WorkdayApiItem["timeEntries"],
  now: Date
) {
  let totalSeconds = 0
  let openEntryAt: Date | null = null

  for (const entry of [...entries].sort(
    (left, right) =>
      new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  )) {
    const recordedAt = new Date(entry.recordedAt)

    if (Number.isNaN(recordedAt.getTime())) {
      continue
    }

    if (entry.kind === "ENTRY") {
      openEntryAt = recordedAt
      continue
    }

    if (!openEntryAt) {
      continue
    }

    totalSeconds += Math.max(
      0,
      Math.floor((recordedAt.getTime() - openEntryAt.getTime()) / 1000)
    )
    openEntryAt = null
  }

  if (openEntryAt) {
    totalSeconds += Math.max(
      0,
      Math.floor((now.getTime() - openEntryAt.getTime()) / 1000)
    )
  }

  return totalSeconds
}

function formatDurationClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
