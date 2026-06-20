import type { TimeEntry } from "@prisma/client"

import { getDateKey, getStoredDateOnly } from "./time-records.domain.js"
import type { WorkdayLike } from "./time-records.types.js"

export function serializeTimeEntry(entry: TimeEntry) {
  return {
    id: entry.id,
    kind: entry.kind,
    source: entry.source,
    status: entry.status,
    sequence: entry.sequence,
    timezone: entry.timezone,
    recordedAt: entry.recordedAt,
    location:
      entry.latitude === null || entry.longitude === null
        ? null
        : {
            latitude: entry.latitude,
            longitude: entry.longitude,
            accuracyMeters: entry.accuracyMeters,
          },
  }
}

export function serializeWorkday(workday: WorkdayLike) {
  return {
    id: workday.id,
    date: getDateKey(getStoredDateOnly(workday.date)),
    status: workday.status,
    scheduledMinutes: workday.scheduledMinutes,
    workedMinutes: workday.workedMinutes,
    overtimeMinutes: workday.overtimeMinutes,
    missingMinutes: workday.missingMinutes,
    nightMinutes: workday.nightMinutes,
    isHoliday: workday.isHoliday,
    timeEntries: workday.timeEntries?.map(serializeTimeEntry) ?? [],
  }
}
