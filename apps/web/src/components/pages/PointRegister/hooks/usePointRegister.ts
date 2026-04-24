// External Libraries
import { useEffect, useRef, useState } from "react"

// Constants
import { POINT_RECORDS } from "../constants"

// Types
import type { PointRecord } from "../types"

// Utils
import { formatPointDate, formatPointTime } from "../utils"

// Types
import type { AdjustmentRequestSidePanelMethods } from "../components/modals/AdjustmentRequestSidePanel/types"
import { ConfirmationModalMethods } from "../components/modals/ConfirmationModal/types"
import type { DayHistorySidePanelMethods } from "../components/modals/DayHistorySidePanel/types"

export function usePointRegister() {
  // Refs
  const adjustmentRequestSidePanelRef =
    useRef<AdjustmentRequestSidePanelMethods>(null)
  const confirmationModalRef = useRef<ConfirmationModalMethods>(null)
  const dayHistorySidePanelRef = useRef<DayHistorySidePanelMethods>(null)

  // States
  const [now, setNow] = useState<Date | null>(null)
  const [records] = useState<PointRecord[]>(POINT_RECORDS)
  const [currentRecords, setCurrentRecords] = useState<PointRecord[]>(
    POINT_RECORDS.slice(0, 2)
  )
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<PointRecord | null>(null)

  const currentDate = now ? formatPointDate(now) : "--"
  const currentTime = now ? formatPointTime(now) : "--:--:--"

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

  // Functions
  function handleRegisterPoint() {
    setCurrentRecords((currentRecords) => [
      {
        id: Date.now(),
        time: currentTime,
        workedHours: "00h 00min",
        extraHours: "00h 00min",
        missingHours: "00h 00min",
        type: getNextPointType(currentRecords),
        status: "Registrado",
      },
      ...currentRecords,
    ])
  }

  // Functions
  function handleConfirmationModalOpen() {
    confirmationModalRef.current?.open()
  }

  function handleHistoryRecordSelect(record: PointRecord) {
    setSelectedHistoryRecord(record)
    dayHistorySidePanelRef.current?.open()
  }

  function handleAdjustmentRequestOpen(record: PointRecord) {
    setSelectedHistoryRecord(record)
    adjustmentRequestSidePanelRef.current?.open()
  }

  return {
    records,
    currentDate,
    currentTime,
    currentRecords,
    selectedHistoryRecord,
    adjustmentRequestSidePanelRef,
    confirmationModalRef,
    dayHistorySidePanelRef,
    handleAdjustmentRequestOpen,
    handleRegisterPoint,
    handleConfirmationModalOpen,
    handleHistoryRecordSelect,
  }
}

function getNextPointType(records: PointRecord[]) {
  return records[0]?.type === "Entrada" ? "Saída" : "Entrada"
}
