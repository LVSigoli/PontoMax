import type { TimeEntryApiItem, WorkdayApiItem } from "@/services/domain"
import { formatHoursWithMinutes, formatTimeLabel } from "@/services/utils"
import type {
  PointRecordStatus,
  PointRecordType,
  WorkdaySummary,
} from "./types"

export const WORKDAY_TIMEZONE = "America/Sao_Paulo"

export const getPointTypeClass = (type: PointRecordType) => {
  return type === "Entrada" ? "text-success-700" : "text-danger-700"
}

export const getPointStatusClass = (status: PointRecordStatus) => {
  if (status === "Falta" || status === "Recusado") {
    return "bg-danger-50 text-danger-700"
  }

  if (status === "Pendente" || status === "Atrasado") {
    return "bg-warning-50 text-warning-700"
  }

  return "bg-success-50 text-success-700"
}

export const formatPointDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: WORKDAY_TIMEZONE,
  }).format(date)
}

export const formatPointTime = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: WORKDAY_TIMEZONE,
  }).format(date)
}

export function getDateKeyFromValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: WORKDAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value ?? "0000"
  const month = parts.find((part) => part.type === "month")?.value ?? "00"
  const day = parts.find((part) => part.type === "day")?.value ?? "00"

  return `${year}-${month}-${day}`
}

export function getWorkdayDateKey(value: string) {
  const matchedDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]

  if (matchedDate) {
    return matchedDate
  }

  return getDateKeyFromValue(value)
}

export function formatWorkdayDate(
  value: string,
  options?: {
    withYear?: boolean
  }
) {
  const [year = "", month = "", day = ""] = getWorkdayDateKey(value).split("-")

  if (!year || !month || !day) {
    return "--"
  }

  if (options?.withYear) {
    return `${day}/${month}/${year}`
  }

  return `${day}/${month}`
}

export function isBusinessDay(value: string) {
  const [year, month, day] = getWorkdayDateKey(value).split("-").map(Number)

  if (!year || !month || !day) return false

  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay()

  return weekday !== 0 && weekday !== 6
}

function isAbsentWorkday(workday: WorkdayApiItem) {
  return (
    workday.status === "INCONSISTENT" &&
    workday.timeEntries.length === 0 &&
    workday.scheduledMinutes > 0 &&
    workday.missingMinutes >= workday.scheduledMinutes
  )
}

export function mapWorkdayStatusToPointStatus(
  workday: WorkdayApiItem
): PointRecordStatus {
  if (isAbsentWorkday(workday)) {
    return "Falta"
  }

  if (
    workday.status === "PENDING_ADJUSTMENT" ||
    workday.status === "INCONSISTENT"
  ) {
    return "Pendente"
  }

  if (workday.status === "ADJUSTED") return "Aprovado"

  if (workday.status === "REJECTED") return "Recusado"

  if (workday.status === "LATE") return "Atrasado"

  return "Registrado"
}

export function mapTimeEntryKindToPointType(
  kind: TimeEntryApiItem["kind"]
): PointRecordType {
  return kind === "ENTRY" ? "Entrada" : "Saida"
}

export function formatPointLocation(location: TimeEntryApiItem["location"]) {
  if (!location) {
    return "Nao informada"
  }

  const latitude = location.latitude.toFixed(6)
  const longitude = location.longitude.toFixed(6)
  const accuracyLabel =
    location.accuracyMeters != null
      ? ` | Precisao: ${Math.round(location.accuracyMeters)} m`
      : ""

  return `Lat ${latitude}, Long ${longitude}${accuracyLabel}`
}

export function mapWorkdayToPointRecords(workday: WorkdayApiItem) {
  return [...workday.timeEntries]
    .sort((left, right) => {
      const leftTime = new Date(left.recordedAt).getTime()
      const rightTime = new Date(right.recordedAt).getTime()

      if (leftTime !== rightTime) {
        return leftTime - rightTime
      }

      return left.sequence - right.sequence
    })
    .map((timeEntry) => ({
      id: timeEntry.id,
      workdayId: workday.id,
      workdayDate: workday.date,
      timeEntryId: timeEntry.id,
      recordedAt: timeEntry.recordedAt,
      location: timeEntry.location,
      time: formatTimeLabel(timeEntry.recordedAt),
      workedHours: formatHoursWithMinutes(workday.workedMinutes),
      extraHours: formatHoursWithMinutes(workday.overtimeMinutes),
      missingHours: formatHoursWithMinutes(workday.missingMinutes),
      type: mapTimeEntryKindToPointType(timeEntry.kind),
      status: mapWorkdayStatusToPointStatus(workday),
    }))
}

export function mapWorkdayToSummary(workday: WorkdayApiItem): WorkdaySummary {
  return {
    id: workday.id,
    workdayDate: workday.date,
    workedHours: formatHoursWithMinutes(workday.workedMinutes),
    extraHours: formatHoursWithMinutes(workday.overtimeMinutes),
    missingHours: formatHoursWithMinutes(workday.missingMinutes),
    recordsCount: workday.timeEntries.length,
    status: mapWorkdayStatusToPointStatus(workday),
    records: mapWorkdayToPointRecords(workday),
  }
}
