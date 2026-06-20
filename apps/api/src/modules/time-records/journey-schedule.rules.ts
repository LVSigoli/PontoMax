import type { TimeEntry } from "@prisma/client"

import { toTimeEntryKind } from "../../common/constants/domain-enums.js"
import { getDateOnly } from "../../common/utils/date.js"
import {
  addUtcDays,
  getLocalMinutes,
  getStoredDateOnly,
  NIGHT_SHIFT_CARRYOVER_MINUTES,
} from "./time-records-date.utils.js"
import { getChronologicalEntries } from "./time-entry.rules.js"
import type { JourneyAssignmentWithJourney } from "./time-records.types.js"

type EntryLike = Pick<TimeEntry, "kind" | "recordedAt" | "sequence">

export function getStoredTimeMinutes(value?: Date | null) {
  if (!value) return null
  return value.getUTCHours() * 60 + value.getUTCMinutes()
}

export function isLateWorkday(params: {
  assignment: JourneyAssignmentWithJourney | null
  entries: EntryLike[]
  scheduledMinutes: number
  timeZone?: string
}) {
  if (!params.assignment || params.scheduledMinutes <= 0) return false

  const journey = params.assignment.journey
  if (journey.flexibleSchedule) return false

  const expectedEntryMinutes = getStoredTimeMinutes(journey.expectedEntryTime)
  const expectedExitMinutes = getStoredTimeMinutes(journey.expectedExitTime)
  if (expectedEntryMinutes === null && expectedExitMinutes === null) {
    return false
  }

  const { firstEntry, lastExit } = getWorkdayEntryBoundaries(params.entries)
  const entryIsLate =
    expectedEntryMinutes !== null && firstEntry
      ? getLocalMinutes(firstEntry.recordedAt, params.timeZone) >
        expectedEntryMinutes + journey.toleranceMinutes
      : false
  const exitIsLate =
    expectedExitMinutes !== null && lastExit
      ? getLocalMinutes(lastExit.recordedAt, params.timeZone) <
        expectedExitMinutes - journey.toleranceMinutes
      : false

  return entryIsLate || exitIsLate
}

export function getScheduledMinutesForDate(
  assignment: JourneyAssignmentWithJourney | null,
  date: Date,
  isHoliday: boolean
) {
  if (isHoliday || !assignment) return 0
  return isScheduledWorkday(assignment, date)
    ? assignment.journey.dailyWorkMinutes
    : 0
}

export function findJourneyAssignmentForDate(
  assignments: JourneyAssignmentWithJourney[],
  date: Date
) {
  const dateTime = date.getTime()

  for (let index = assignments.length - 1; index >= 0; index -= 1) {
    const assignment = assignments[index]
    const validFrom = getStoredDateOnly(assignment.validFrom).getTime()
    const validTo = assignment.validTo
      ? getStoredDateOnly(assignment.validTo).getTime()
      : null

    if (validFrom <= dateTime && (validTo === null || validTo >= dateTime)) {
      return assignment
    }
  }
  return null
}

export function resolveEffectiveWorkdayDate(
  value: Date,
  assignments: JourneyAssignmentWithJourney[],
  timeZone?: string
) {
  const localDate = getDateOnly(value, timeZone)
  const previousDate = addUtcDays(localDate, -1)
  const previousAssignment = findJourneyAssignmentForDate(
    assignments,
    previousDate
  )

  if (
    previousAssignment?.journey.nightShift &&
    getLocalMinutes(value, timeZone) < NIGHT_SHIFT_CARRYOVER_MINUTES
  ) {
    return previousDate
  }
  return localDate
}

function getWorkdayEntryBoundaries(entries: EntryLike[]) {
  const sortedEntries = getChronologicalEntries(entries)
  return {
    firstEntry: sortedEntries.find(
      (entry) => toTimeEntryKind(entry.kind) === "ENTRY"
    ),
    lastExit: [...sortedEntries]
      .reverse()
      .find((entry) => toTimeEntryKind(entry.kind) === "EXIT"),
  }
}

function isScheduledWorkday(
  assignment: JourneyAssignmentWithJourney,
  date: Date
) {
  const scaleCode = assignment.journey.scaleCode.trim().toUpperCase()

  if (scaleCode === "5X2") {
    const weekday = date.getUTCDay()
    return weekday >= 1 && weekday <= 5
  }
  if (scaleCode === "6X1") return date.getUTCDay() !== 0
  if (scaleCode === "12X36") {
    return diffInDays(getStoredDateOnly(assignment.validFrom), date) % 2 === 0
  }

  const cycleMatch = scaleCode.match(/^(\d+)X(\d+)$/)
  if (!cycleMatch) return false

  const workDays = Number(cycleMatch[1])
  const offDays = Number(cycleMatch[2])
  if (workDays <= 0 || offDays <= 0 || workDays > 7 || offDays > 7) {
    return false
  }

  return (
    diffInDays(getStoredDateOnly(assignment.validFrom), date) %
      (workDays + offDays) <
    workDays
  )
}

function diffInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000)
}
