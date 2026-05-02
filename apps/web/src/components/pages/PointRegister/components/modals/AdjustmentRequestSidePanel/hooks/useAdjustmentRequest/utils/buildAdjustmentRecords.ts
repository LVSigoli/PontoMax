import type { PointRecord } from "@/components/pages/PointRegister/types"

import { normalizeWorkdayDate } from "./normalizeWorkdayDate"

export function buildAdjustmentRecords(
  initialRecords: PointRecord[],
  currentRecords: PointRecord[]
) {
  const nextRecords: Array<{
    timeEntryId?: number
    actionType: "CREATE" | "UPDATE" | "DELETE"
    targetKind: "ENTRY" | "EXIT"
    originalRecordedAt?: string
    newRecordedAt?: string
  }> = []

  const currentByEntryId = new Map(
    currentRecords
      .filter((record) => record.timeEntryId)
      .map((record) => [record.timeEntryId, record])
  )

  for (const initialRecord of initialRecords) {
    if (!initialRecord.timeEntryId || !initialRecord.workdayDate) {
      continue
    }

    const currentRecord = currentByEntryId.get(initialRecord.timeEntryId)

    if (!currentRecord) {
      nextRecords.push({
        timeEntryId: initialRecord.timeEntryId,
        actionType: "DELETE",
        targetKind: initialRecord.type === "Entrada" ? "ENTRY" : "EXIT",
        originalRecordedAt: initialRecord.recordedAt,
      })
      continue
    }

    const nextRecordedAt = makeDateTime(
      initialRecord.workdayDate,
      currentRecord.time
    )
    const nextKind = currentRecord.type === "Entrada" ? "ENTRY" : "EXIT"

    if (
      nextRecordedAt !== initialRecord.recordedAt ||
      nextKind !== (initialRecord.type === "Entrada" ? "ENTRY" : "EXIT")
    ) {
      nextRecords.push({
        timeEntryId: initialRecord.timeEntryId,
        actionType: "UPDATE",
        targetKind: nextKind,
        originalRecordedAt: initialRecord.recordedAt,
        newRecordedAt: nextRecordedAt,
      })
    }
  }

  for (const currentRecord of currentRecords) {
    if (currentRecord.timeEntryId || !currentRecord.workdayDate) {
      continue
    }

    nextRecords.push({
      actionType: "CREATE",
      targetKind: currentRecord.type === "Entrada" ? "ENTRY" : "EXIT",
      newRecordedAt: makeDateTime(
        currentRecord.workdayDate,
        currentRecord.time
      ),
    })
  }

  return nextRecords
}

function makeDateTime(date: string, time: string) {
  const [rawHours = "", rawMinutes = ""] = time.trim().split(":")
  const hours = rawHours.padStart(2, "0")
  const minutes = rawMinutes.padStart(2, "0")
  const normalizedDate = normalizeWorkdayDate(date)

  if (!/^\d{2}$/.test(hours) || !/^\d{2}$/.test(minutes)) {
    throw new Error("Informe um horario valido para continuar.")
  }

  if (!normalizedDate) {
    throw new Error("Informe um horario valido para continuar.")
  }

  const parsedDate = new Date(`${normalizedDate}T${hours}:${minutes}:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Informe um horario valido para continuar.")
  }

  return parsedDate.toISOString()
}
