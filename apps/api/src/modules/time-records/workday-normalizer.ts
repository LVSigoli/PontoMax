import {
  calculateWorkedMinutes,
  isAlternatingTimeEntrySequence,
} from "../../common/utils/time-records.js"
import {
  findJourneyAssignmentForDate,
  getScheduledMinutesForDate,
  isLateWorkday,
  resolveEffectiveWorkdayDate,
} from "./journey-schedule.rules.js"
import {
  buildComparableTimeEntries,
  calculateNightMinutes,
  mapWorkedStatus,
  shouldTreatEntriesAsOvernight,
} from "./time-entry.rules.js"
import {
  getComparableRecordedAtForWorkday,
  getDateKey,
  getStoredDateOnly,
} from "./time-records-date.utils.js"
import type {
  JourneyAssignmentWithJourney,
  WorkdayLike,
} from "./time-records.types.js"

export function normalizeWorkdayForTimezone<T extends WorkdayLike>(
  workday: T,
  timeZone?: string,
  assignments: JourneyAssignmentWithJourney[] = []
): T {
  if (!workday.timeEntries) return workday

  const workdayDateKey = getDateKey(getStoredDateOnly(workday.date))
  const workdayAssignment = findJourneyAssignmentForDate(
    assignments,
    getStoredDateOnly(workday.date)
  )
  const treatAsNightShift =
    Boolean(workdayAssignment?.journey.nightShift) ||
    shouldTreatEntriesAsOvernight(workday.timeEntries, timeZone)
  const timeEntries = workday.timeEntries.filter(
    (entry) =>
      getDateKey(
        resolveEffectiveWorkdayDate(entry.recordedAt, assignments, timeZone)
      ) === workdayDateKey
  )
  const sortedTimeEntries = [...timeEntries].sort((left, right) => {
    const leftRecordedAt = getComparableRecordedAtForWorkday(
      workday.date,
      left.recordedAt,
      treatAsNightShift,
      timeZone
    )
    const rightRecordedAt = getComparableRecordedAtForWorkday(
      workday.date,
      right.recordedAt,
      treatAsNightShift,
      timeZone
    )
    return leftRecordedAt.getTime() - rightRecordedAt.getTime()
  })
  const comparableTimeEntries = buildComparableTimeEntries({
    workdayDate: workday.date,
    entries: sortedTimeEntries,
    isNightShift: treatAsNightShift,
    timeZone,
  })
  const workedMinutes = calculateWorkedMinutes(comparableTimeEntries)
  const nightMinutes = calculateNightMinutes(comparableTimeEntries)
  const scheduledMinutes = getScheduledMinutesForDate(
    workdayAssignment,
    getStoredDateOnly(workday.date),
    workday.isHoliday
  )
  const overtimeMinutes = Math.max(0, workedMinutes - scheduledMinutes)
  const missingMinutes = Math.max(0, scheduledMinutes - workedMinutes)
  const status =
    workday.status === "PENDING_ADJUSTMENT" ||
    workday.status === "ADJUSTED" ||
    workday.status === "REJECTED"
      ? workday.status
      : mapWorkedStatus({
          totalEntries: timeEntries.length,
          isLate: isLateWorkday({
            assignment: workdayAssignment,
            entries: timeEntries,
            scheduledMinutes,
            timeZone,
          }),
          isSequenceValid: isAlternatingTimeEntrySequence(
            comparableTimeEntries
          ),
        })

  return {
    ...workday,
    scheduledMinutes,
    workedMinutes,
    overtimeMinutes,
    missingMinutes,
    nightMinutes,
    status,
    timeEntries: sortedTimeEntries,
  }
}

export function shouldIgnoreWorkdayInSummary(workday: WorkdayLike) {
  return (
    workday.timeEntries?.length === 0 &&
    (workday.status === "ADJUSTED" ||
      workday.status === "PENDING_ADJUSTMENT" ||
      workday.status === "REJECTED")
  )
}
