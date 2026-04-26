// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Services
import { getTimeRecords, registerTimeRecord } from "@/services/domain"

// Types
import type { PointRecord } from "../types"

// Utils
import {
  formatPointDate,
  formatPointTime,
  mapWorkdayToPointRecords,
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
  const [records, setRecords] = useState<PointRecord[]>([])
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<PointRecord | null>(null)
  const [adjustmentRequestRecords, setAdjustmentRequestRecords] = useState<
    PointRecord[]
  >([])

  const currentDate = now ? formatPointDate(now) : "--"
  const currentTime = now ? formatPointTime(now) : "--:--:--"
  const todayKey = useMemo(
    () => (now ?? new Date()).toISOString().slice(0, 10),
    [now]
  )

  const currentRecords = useMemo(
    () => records.filter((record) => record.workdayDate === todayKey),
    [records, todayKey]
  )

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

  async function loadRecords() {
    const workdays = await getTimeRecords()
    setRecords(workdays.flatMap(mapWorkdayToPointRecords))
  }

  async function handleRegisterPoint() {
    await registerTimeRecord()
    await loadRecords()
  }

  function handleConfirmationModalOpen() {
    confirmationModalRef.current?.open()
  }

  function handleHistoryRecordSelect(record: PointRecord | null) {
    if (!record) return

    setSelectedHistoryRecord(record)
    dayHistorySidePanelRef.current?.open()
  }

  function handleAdjustmentRequestOpen(record: PointRecord) {
    setSelectedHistoryRecord(record)
    setAdjustmentRequestRecords(
      records.filter((item) => item.workdayDate === record.workdayDate)
    )
    adjustmentRequestSidePanelRef.current?.open()
  }

  async function handleAdjustmentRequestSubmitted() {
    await loadRecords()
  }

  return {
    records,
    currentDate,
    currentTime,
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
