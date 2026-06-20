import type {
  TimeEntryKind,
  TimeEntrySource,
} from "../../common/constants/domain-enums.js"
import { AppError } from "../../common/errors/app-error.js"
import { getDateOnly } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import {
  addUtcDays,
  getLastChronologicalEntry,
  getLocalMinutes,
  getNextExpectedTimeEntryKind,
  NIGHT_SHIFT_CARRYOVER_MINUTES,
  resolveEffectiveWorkdayDate,
} from "./time-records.domain.js"
import { getJourneyAssignmentsForRange } from "./time-records.repository.js"
import type { TimeEntryLocationInput } from "./time-records.types.js"
import {
  ensureWorkday,
  recalculateWorkday,
} from "./workday-lifecycle.service.js"

export async function createTimeEntry(params: {
  companyId: number
  location?: TimeEntryLocationInput
  userId: number
  recordedAt: Date
  source: TimeEntrySource
  kind?: TimeEntryKind
  timezone?: string
}) {
  const openPreviousWorkdayDate = await findOpenPreviousWorkdayDateForUser({
    userId: params.userId,
    recordedAt: params.recordedAt,
    timezone: params.timezone,
  })
  const effectiveWorkdayDate =
    openPreviousWorkdayDate ??
    (await getEffectiveWorkdayDateForUser({
      userId: params.userId,
      recordedAt: params.recordedAt,
      timezone: params.timezone,
    }))
  const workday = await ensureWorkday({
    companyId: params.companyId,
    userId: params.userId,
    date: effectiveWorkdayDate,
    timezone: params.timezone,
  })

  const existingActiveEntries = await prisma.timeEntry.findMany({
    where: {
      workdayId: workday.id,
      status: "ACTIVE",
    },
    orderBy: {
      recordedAt: "asc",
    },
  })

  const lastActiveEntry = getLastChronologicalEntry(existingActiveEntries)
  const expectedKind = getNextExpectedTimeEntryKind(existingActiveEntries)
  const kind = params.kind ?? expectedKind

  if (params.kind && params.kind !== expectedKind) {
    throw new AppError(`The next time entry kind must be ${expectedKind}.`, 400)
  }

  if (
    lastActiveEntry &&
    params.recordedAt.getTime() <= lastActiveEntry.recordedAt.getTime()
  ) {
    throw new AppError(
      "The new time entry must be later than the latest registered point.",
      400
    )
  }

  const nextSequenceResult = await prisma.timeEntry.aggregate({
    where: {
      workdayId: workday.id,
    },
    _max: {
      sequence: true,
    },
  })

  const createdEntry = await prisma.timeEntry.create({
    data: {
      accuracyMeters: params.location?.accuracyMeters ?? null,
      workdayId: workday.id,
      userId: params.userId,
      latitude: params.location?.latitude ?? null,
      longitude: params.location?.longitude ?? null,
      recordedAt: params.recordedAt,
      source: params.source,
      kind,
      sequence: (nextSequenceResult._max.sequence ?? 0) + 1,
      timezone: params.timezone ?? "America/Sao_Paulo",
    },
  })

  const updatedWorkday = await recalculateWorkday(workday.id)

  return {
    workday: updatedWorkday,
    entry: createdEntry,
  }
}

async function getEffectiveWorkdayDateForUser(params: {
  userId: number
  recordedAt: Date
  timezone?: string
}) {
  const localDate = getDateOnly(params.recordedAt, params.timezone)
  const assignments = await getJourneyAssignmentsForRange({
    userId: params.userId,
    from: addUtcDays(localDate, -1),
    to: localDate,
  })

  return resolveEffectiveWorkdayDate(
    params.recordedAt,
    assignments,
    params.timezone
  )
}

async function findOpenPreviousWorkdayDateForUser(params: {
  userId: number
  recordedAt: Date
  timezone?: string
}) {
  if (
    getLocalMinutes(params.recordedAt, params.timezone) >=
    NIGHT_SHIFT_CARRYOVER_MINUTES
  ) {
    return null
  }

  const localDate = getDateOnly(params.recordedAt, params.timezone)
  const previousDate = addUtcDays(localDate, -1)
  const previousWorkday = await prisma.workday.findUnique({
    where: {
      userId_date: {
        userId: params.userId,
        date: previousDate,
      },
    },
    include: {
      timeEntries: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  })

  if (
    !previousWorkday ||
    getLastChronologicalEntry(previousWorkday.timeEntries)?.kind !== "ENTRY"
  ) {
    return null
  }

  return previousDate
}
