// External Libraries
import { useEffect, useRef, useState } from "react"

// Constants
import { POINT_RECORDS } from "../constants"

// Types
import type { PointRecord } from "../types"

// Utils
import { formatPointDate, formatPointTime } from "../utils"

// Types
import { ConfirmationModalMethods } from "../components/modals/ConfirmationModal/types"

export function usePointRegister() {
  // Refs
  const confirmationModalRef = useRef<ConfirmationModalMethods>(null)

  // States
  const [now, setNow] = useState(() => new Date())
  const [records] = useState<PointRecord[]>(POINT_RECORDS)
  const [currentRecords, setCurrentRecords] = useState<PointRecord[]>(
    POINT_RECORDS.slice(0, 2)
  )

  const currentDate = formatPointDate(now)
  const currentTime = formatPointTime(now)

  // Effects
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(interval)
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

  return {
    records,
    currentDate,
    currentTime,
    currentRecords,
    confirmationModalRef,
    handleRegisterPoint,
    handleConfirmationModalOpen,
  }
}

function getNextPointType(records: PointRecord[]) {
  return records[0]?.type === "Entrada" ? "Saída" : "Entrada"
}
