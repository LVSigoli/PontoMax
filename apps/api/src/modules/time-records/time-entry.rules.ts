import type { TimeEntry } from "@prisma/client"

import { toTimeEntryKind } from "../../common/constants/domain-enums.js"
import {
  addUtcDays,
  getComparableRecordedAtForWorkday,
  getLocalMinutes,
  getStoredDateOnly,
  NIGHT_SHIFT_CARRYOVER_MINUTES,
} from "./time-records-date.utils.js"

type EntryLike = Pick<TimeEntry, "kind" | "recordedAt" | "sequence">

export function mapWorkedStatus(params: {
  totalEntries: number
  isLate: boolean
  isSequenceValid: boolean
}) {
  if (
    params.totalEntries === 0 ||
    !params.isSequenceValid ||
    params.totalEntries % 2 !== 0
  ) {
    return "INCONSISTENT" as const
  }
  return params.isLate ? ("LATE" as const) : ("CLOSED" as const)
}

export function getChronologicalEntries(entries: EntryLike[]) {
  return [...entries].sort(
    (left, right) =>
      left.recordedAt.getTime() - right.recordedAt.getTime() ||
      left.sequence - right.sequence
  )
}

export function getLastChronologicalEntry(entries: EntryLike[]) {
  return getChronologicalEntries(entries).at(-1) ?? null
}

export function getNextExpectedTimeEntryKind(entries: EntryLike[]) {
  const lastEntry = getLastChronologicalEntry(entries)
  if (!lastEntry) return "ENTRY" as const
  return toTimeEntryKind(lastEntry.kind) === "ENTRY"
    ? ("EXIT" as const)
    : ("ENTRY" as const)
}

export function buildComparableTimeEntries(params: {
  workdayDate: Date
  entries: EntryLike[]
  isNightShift: boolean
  timeZone?: string
}) {
  return getChronologicalEntries(params.entries).map((entry) => ({
    kind: toTimeEntryKind(entry.kind),
    recordedAt: getComparableRecordedAtForWorkday(
      params.workdayDate,
      entry.recordedAt,
      params.isNightShift,
      params.timeZone
    ),
    sequence: entry.sequence,
  }))
}

export function calculateNightMinutes(entries: EntryLike[]) {
  let total = 0
  let openEntry: Date | null = null

  for (const entry of entries) {
    if (entry.kind === "ENTRY") {
      openEntry = entry.recordedAt
      continue
    }
    if (!openEntry) continue
    total += getNightOverlapMinutes(openEntry, entry.recordedAt)
    openEntry = null
  }

  return total
}

export function shouldTreatEntriesAsOvernight(
  entries: TimeEntry[],
  timeZone?: string
) {
  const localMinutes = entries.map((entry) =>
    getLocalMinutes(entry.recordedAt, timeZone)
  )
  return (
    localMinutes.some((minutes) => minutes >= 18 * 60) &&
    localMinutes.some((minutes) => minutes < NIGHT_SHIFT_CARRYOVER_MINUTES)
  )
}

function getNightOverlapMinutes(start: Date, end: Date) {
  let total = 0
  let cursor = addUtcDays(getStoredDateOnly(start), -1)
  const finalDay = getStoredDateOnly(end)

  while (cursor.getTime() <= finalDay.getTime()) {
    const nightStart = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate(),
        22
      )
    )
    const nightEnd = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1,
        5
      )
    )
    const overlapStart = Math.max(start.getTime(), nightStart.getTime())
    const overlapEnd = Math.min(end.getTime(), nightEnd.getTime())

    if (overlapEnd > overlapStart) {
      total += Math.round((overlapEnd - overlapStart) / 60000)
    }
    cursor = addUtcDays(cursor, 1)
  }

  return total
}
