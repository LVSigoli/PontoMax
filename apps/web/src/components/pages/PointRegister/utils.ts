import type { PointRecordStatus, PointRecordType } from "./types"
import type { TimeEntryApiItem, WorkdayApiItem } from "@/services/domain"
import { formatHoursWithMinutes, formatTimeLabel } from "@/services/utils"

export const getPointTypeClass = (type: PointRecordType) => {
  return type === "Entrada" ? "text-success-700" : "text-danger-700"
}

export const getPointStatusClass = (status: PointRecordStatus) => {
  if (status === "Pendente") return "bg-warning-50 text-warning-700"

  return "bg-success-50 text-success-700"
}

export const formatPointDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export const formatPointTime = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

export function mapWorkdayStatusToPointStatus(status: WorkdayApiItem["status"]): PointRecordStatus {
  if (status === "PENDING_ADJUSTMENT" || status === "INCONSISTENT") {
    return "Pendente"
  }

  if (status === "ADJUSTED") {
    return "Aprovado"
  }

  return "Registrado"
}

export function mapTimeEntryKindToPointType(kind: TimeEntryApiItem["kind"]): PointRecordType {
  return kind === "ENTRY" ? "Entrada" : "Saída"
}

export function mapWorkdayToPointRecords(workday: WorkdayApiItem) {
  return workday.timeEntries.map((timeEntry) => ({
    id: timeEntry.id,
    workdayId: workday.id,
    workdayDate: workday.date,
    timeEntryId: timeEntry.id,
    recordedAt: timeEntry.recordedAt,
    time: formatTimeLabel(timeEntry.recordedAt),
    workedHours: formatHoursWithMinutes(workday.workedMinutes),
    extraHours: formatHoursWithMinutes(workday.overtimeMinutes),
    missingHours: formatHoursWithMinutes(workday.missingMinutes),
    type: mapTimeEntryKindToPointType(timeEntry.kind),
    status: mapWorkdayStatusToPointStatus(workday.status),
  }))
}
