import { getDateOnly } from "../../common/utils/date.js"

export const NIGHT_SHIFT_CARRYOVER_MINUTES = 12 * 60

export function getLocalMinutes(value: Date, timeZone = "America/Sao_Paulo") {
  const { hours, minutes } = getLocalTimeParts(value, timeZone)
  return hours * 60 + minutes
}

export function getComparableRecordedAtForWorkday(
  workdayDate: Date,
  recordedAt: Date,
  isNightShift: boolean,
  timeZone?: string
) {
  if (!isNightShift) return recordedAt

  const baseDate = getStoredDateOnly(workdayDate)
  const localMinutes = getLocalMinutes(recordedAt, timeZone)
  const dayOffset = localMinutes < NIGHT_SHIFT_CARRYOVER_MINUTES ? 1 : 0
  const { hours, minutes } = getLocalTimeParts(recordedAt, timeZone)

  return new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate() + dayOffset,
      hours,
      minutes
    )
  )
}

export function addUtcDays(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + amount
    )
  )
}

export function minDate(left: Date | null, right: Date | null) {
  if (!left) return right
  if (!right) return left
  return left.getTime() <= right.getTime() ? left : right
}

export function normalizeWorkdayDateInput(
  value: Date | string,
  timeZone?: string
) {
  if (typeof value === "string") return getDateOnly(value, timeZone)
  if (isUtcDateOnly(value)) return getStoredDateOnly(value)
  return getDateOnly(value, timeZone)
}

export function getStoredDateOnly(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  )
}

export function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function makeSyntheticWorkdayId(date: Date) {
  return -date.getTime()
}

function getLocalTimeParts(value: Date, timeZone = "America/Sao_Paulo") {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const parts = formatter.formatToParts(value)
  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minutes = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  )

  return { hours, minutes }
}

function isUtcDateOnly(value: Date) {
  return (
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0
  )
}
