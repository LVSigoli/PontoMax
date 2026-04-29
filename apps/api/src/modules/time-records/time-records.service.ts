import type { Journey, TimeEntry, UserJourneyAssignment, Workday } from "@prisma/client"

import {
  toTimeEntryKind,
  type TimeEntryKind,
  type TimeEntrySource,
} from "../../common/constants/domain-enums.js"
import { getDateOnly } from "../../common/utils/date.js"
import { calculateWorkedMinutes } from "../../common/utils/time-records.js"
import { prisma } from "../../lib/prisma.js"

type JourneyAssignmentWithJourney = UserJourneyAssignment & {
  journey: Journey
}

type WorkdayLike = Pick<
  Workday,
  | "id"
  | "date"
  | "status"
  | "scheduledMinutes"
  | "workedMinutes"
  | "overtimeMinutes"
  | "missingMinutes"
  | "nightMinutes"
  | "isHoliday"
> & {
  timeEntries?: TimeEntry[]
}

export interface WorkdayOverviewSummary {
  workedDays: number
  balanceMinutes: number
  inconsistentCount: number
  pendingAdjustments: number
}

export interface WorkdayOverviewResponse {
  items: Array<ReturnType<typeof serializeWorkday>>
  meta: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

const NIGHT_SHIFT_CARRYOVER_MINUTES = 12 * 60

function mapWorkedStatus(params: {
  totalEntries: number
  workedMinutes: number
  scheduledMinutes: number
}) {
  const { totalEntries, workedMinutes, scheduledMinutes } = params

  if (totalEntries === 0 || totalEntries % 2 !== 0) {
    return "INCONSISTENT" as const
  }

  if (workedMinutes > scheduledMinutes) {
    return "CLOSED" as const
  }

  return "CLOSED" as const
}

export async function ensureWorkday(params: {
  companyId: number
  userId: number
  date: Date | string
  timezone?: string
}) {
  const date = getDateOnly(params.date, params.timezone)
  const assignment = await prisma.userJourneyAssignment.findFirst({
    where: {
      userId: params.userId,
      validFrom: { lte: date },
      OR: [{ validTo: null }, { validTo: { gte: date } }],
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "desc",
    },
  })

  const holiday = await prisma.holiday.findFirst({
    where: {
      companyId: params.companyId,
      date,
      isActive: true,
    },
  })

  return prisma.workday.upsert({
    where: {
      userId_date: {
        userId: params.userId,
        date,
      },
    },
    update: {
      holidayId: holiday?.id ?? null,
      isHoliday: Boolean(holiday),
      scheduledMinutes: assignment?.journey.dailyWorkMinutes ?? 0,
    },
    create: {
      companyId: params.companyId,
      userId: params.userId,
      date,
      holidayId: holiday?.id ?? null,
      isHoliday: Boolean(holiday),
      scheduledMinutes: assignment?.journey.dailyWorkMinutes ?? 0,
    },
  })
}

export async function getTodayWorkdaySnapshot(params: {
  companyId: number
  userId: number
  timezone?: string
}) {
  const assignments = await getJourneyAssignmentsForRange({
    userId: params.userId,
    from: addUtcDays(getDateOnly(new Date(), params.timezone), -1),
    to: getDateOnly(new Date(), params.timezone),
  })
  const date = resolveEffectiveWorkdayDate(new Date(), assignments, params.timezone)
  const assignment = await prisma.userJourneyAssignment.findFirst({
    where: {
      userId: params.userId,
      validFrom: { lte: date },
      OR: [{ validTo: null }, { validTo: { gte: date } }],
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "desc",
    },
  })

  const holiday = await prisma.holiday.findFirst({
    where: {
      companyId: params.companyId,
      date,
      isActive: true,
    },
  })

  const workday = await prisma.workday.findUnique({
    where: {
      userId_date: {
        userId: params.userId,
        date,
      },
    },
    include: {
      timeEntries: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          recordedAt: "asc",
        },
      },
    },
  })

  if (workday) {
    return serializeWorkday(
      normalizeWorkdayForTimezone(workday, params.timezone, assignments)
    )
  }

  const scheduledMinutes = assignment?.journey.dailyWorkMinutes ?? 0

  return serializeWorkday({
    id: makeSyntheticWorkdayId(date),
    date,
    status: "OPEN",
    scheduledMinutes,
    workedMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: scheduledMinutes,
    nightMinutes: 0,
    isHoliday: Boolean(holiday),
    timeEntries: [],
  })
}

export async function getWorkdayOverview(params: {
  userId: number
  page: number
  pageSize: number
  timezone?: string
}): Promise<WorkdayOverviewResponse> {
  const today = getDateOnly(new Date(), params.timezone)
  const [totalItems, workdays] = await Promise.all([
    prisma.workday.count({
      where: {
        userId: params.userId,
        date: {
          lt: today,
        },
      },
    }),
    prisma.workday.findMany({
      where: {
        userId: params.userId,
        date: {
          lt: today,
        },
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      skip: Math.max(0, (params.page - 1) * params.pageSize),
      take: params.pageSize,
    }),
  ])
  const earliestWorkdayDate = workdays.reduce<Date | null>(
    (current, workday) =>
      !current || workday.date.getTime() < current.getTime() ? workday.date : current,
    null
  )
  const assignments = await getJourneyAssignmentsForRange({
    userId: params.userId,
    from: earliestWorkdayDate ? addUtcDays(getStoredDateOnly(earliestWorkdayDate), -1) : today,
    to: today,
  })

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize)

  return {
    items: workdays.map((workday) =>
      serializeWorkday(normalizeWorkdayForTimezone(workday, params.timezone, assignments))
    ),
    meta: {
      page: totalPages === 0 ? 1 : Math.min(params.page, totalPages),
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
  }
}

export async function getUserWorkdaySummary(params: {
  companyId: number
  userId: number
  timezone?: string
}): Promise<WorkdayOverviewSummary> {
  const today = getDateOnly(new Date(), params.timezone)
  const workdays = await prisma.workday.findMany({
    where: {
      userId: params.userId,
      date: {
        lt: today,
      },
    },
    include: {
      timeEntries: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          recordedAt: "asc",
        },
      },
    },
  })

  const holidays = await prisma.holiday.findMany({
    where: {
      companyId: params.companyId,
      isActive: true,
      date: {
        gte:
          workdays.length > 0
            ? getStoredDateOnly(
                [...workdays].sort((left, right) => left.date.getTime() - right.date.getTime())[0]!
                  .date
              )
            : today,
        lt: today,
      },
    },
  })

  const [pendingAdjustments, holidayKeys] = await Promise.all([
    prisma.adjustmentRequest.count({
      where: {
        companyId: params.companyId,
        userId: params.userId,
        status: "PENDING",
      },
    }),
    Promise.resolve(new Set(holidays.map((holiday) => getDateKey(getStoredDateOnly(holiday.date))))),
  ])
  const assignments = await getJourneyAssignmentsForRange({
    userId: params.userId,
    from:
      workdays.length > 0
        ? addUtcDays(
            getStoredDateOnly(
              [...workdays].sort((left, right) => left.date.getTime() - right.date.getTime())[0]!
                .date
            ),
            -1
          )
        : today,
    to: today,
  })

  if (assignments.length === 0 && workdays.length === 0) {
    return {
      workedDays: 0,
      balanceMinutes: 0,
      inconsistentCount: 0,
      pendingAdjustments: 0,
    }
  }

  const normalizedWorkdays = workdays.map((workday) =>
    normalizeWorkdayForTimezone(workday, params.timezone, assignments)
  )

  const relevantWorkdays = normalizedWorkdays.filter((workday) => {
    if (shouldIgnoreWorkdayInSummary(workday)) {
      return false
    }

    const date = getStoredDateOnly(workday.date)
    const assignment = findJourneyAssignmentForDate(assignments, date)

    if (!assignment) {
      return false
    }

    const dateKey = getDateKey(date)

    if (holidayKeys.has(dateKey)) {
      return false
    }

    return isScheduledWorkday(assignment, date)
  })

  const summary = relevantWorkdays.reduce<Omit<WorkdayOverviewSummary, "pendingAdjustments">>(
    (summary, workday) => {
      if (workday.workedMinutes > 0) {
        summary.workedDays += 1
      }

      summary.balanceMinutes += workday.overtimeMinutes - workday.missingMinutes

      if (workday.status === "INCONSISTENT" || workday.status === "PENDING_ADJUSTMENT") {
        summary.inconsistentCount += 1
      }

      return summary
    },
    {
      workedDays: 0,
      balanceMinutes: 0,
      inconsistentCount: 0,
    },
  )

  return {
    ...summary,
    pendingAdjustments,
  }
}

export async function recalculateWorkday(workdayId: number) {
  const workday = await prisma.workday.findUniqueOrThrow({
    where: { id: workdayId },
    include: {
      timeEntries: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          recordedAt: "asc",
        },
      },
    },
  })

  const workedMinutes = calculateWorkedMinutes(
    workday.timeEntries.map((entry) => ({
      kind: toTimeEntryKind(entry.kind),
      recordedAt: entry.recordedAt,
    }))
  )
  const overtimeMinutes = Math.max(0, workedMinutes - workday.scheduledMinutes)
  const missingMinutes = Math.max(0, workday.scheduledMinutes - workedMinutes)
  const status = mapWorkedStatus({
    totalEntries: workday.timeEntries.length,
    workedMinutes,
    scheduledMinutes: workday.scheduledMinutes,
  })

  return prisma.workday.update({
    where: { id: workdayId },
    data: {
      workedMinutes,
      overtimeMinutes,
      missingMinutes,
      status,
    },
    include: {
      timeEntries: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          recordedAt: "asc",
        },
      },
    },
  })
}

export async function createTimeEntry(params: {
  companyId: number
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
      sequence: "asc",
    },
  })

  const kind =
    params.kind ??
    (existingActiveEntries.length % 2 === 0 ? ("ENTRY" as const) : ("EXIT" as const))

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
      workdayId: workday.id,
      userId: params.userId,
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

export function serializeTimeEntry(entry: TimeEntry) {
  return {
    id: entry.id,
    kind: entry.kind,
    source: entry.source,
    status: entry.status,
    sequence: entry.sequence,
    timezone: entry.timezone,
    recordedAt: entry.recordedAt,
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

function findJourneyAssignmentForDate(
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

function isScheduledWorkday(assignment: JourneyAssignmentWithJourney, date: Date) {
  const scaleCode = assignment.journey.scaleCode.trim().toUpperCase()

  if (scaleCode === "5X2") {
    const weekday = date.getUTCDay()
    return weekday >= 1 && weekday <= 5
  }

  if (scaleCode === "6X1") {
    return date.getUTCDay() !== 0
  }

  if (scaleCode === "12X36") {
    return diffInDays(getDateOnly(assignment.validFrom), date) % 2 === 0
  }

  const cycleMatch = scaleCode.match(/^(\d+)X(\d+)$/)

  if (!cycleMatch) {
    return false
  }

  const workDays = Number(cycleMatch[1])
  const offDays = Number(cycleMatch[2])

  if (workDays <= 0 || offDays <= 0 || workDays > 7 || offDays > 7) {
    return false
  }

  const cycleLength = workDays + offDays
  const dayIndex = diffInDays(getDateOnly(assignment.validFrom), date) % cycleLength

  return dayIndex < workDays
}

function diffInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000)
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function normalizeWorkdayForTimezone<T extends WorkdayLike>(
  workday: T,
  timeZone?: string,
  assignments: JourneyAssignmentWithJourney[] = []
): T {
  if (!workday.timeEntries) {
    return workday
  }

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
      getDateKey(resolveEffectiveWorkdayDate(entry.recordedAt, assignments, timeZone)) ===
      workdayDateKey
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
  const workedMinutes = calculateWorkedMinutes(
    sortedTimeEntries.map((entry) => ({
      kind: toTimeEntryKind(entry.kind),
      recordedAt: getComparableRecordedAtForWorkday(
        workday.date,
        entry.recordedAt,
        treatAsNightShift,
        timeZone
      ),
    }))
  )
  const overtimeMinutes = Math.max(0, workedMinutes - workday.scheduledMinutes)
  const missingMinutes = Math.max(0, workday.scheduledMinutes - workedMinutes)
  const status =
    workday.status === "PENDING_ADJUSTMENT" || workday.status === "ADJUSTED"
      ? workday.status
      : mapWorkedStatus({
          totalEntries: timeEntries.length,
          workedMinutes,
          scheduledMinutes: workday.scheduledMinutes,
        })

  return {
    ...workday,
    workedMinutes,
    overtimeMinutes,
    missingMinutes,
    status,
    timeEntries: sortedTimeEntries,
  }
}

function shouldIgnoreWorkdayInSummary(workday: WorkdayLike) {
  return (
    workday.timeEntries?.length === 0 &&
    (workday.status === "ADJUSTED" || workday.status === "PENDING_ADJUSTMENT")
  )
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

  return resolveEffectiveWorkdayDate(params.recordedAt, assignments, params.timezone)
}

async function findOpenPreviousWorkdayDateForUser(params: {
  userId: number
  recordedAt: Date
  timezone?: string
}) {
  if (getLocalMinutes(params.recordedAt, params.timezone) >= NIGHT_SHIFT_CARRYOVER_MINUTES) {
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

  if (!previousWorkday || previousWorkday.timeEntries.length % 2 === 0) {
    return null
  }

  return previousDate
}

async function getJourneyAssignmentsForRange(params: {
  userId: number
  from: Date
  to: Date
}) {
  return prisma.userJourneyAssignment.findMany({
    where: {
      userId: params.userId,
      validFrom: {
        lte: params.to,
      },
      OR: [{ validTo: null }, { validTo: { gte: params.from } }],
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "asc",
    },
  })
}

function resolveEffectiveWorkdayDate(
  value: Date,
  assignments: JourneyAssignmentWithJourney[],
  timeZone?: string
) {
  const localDate = getDateOnly(value, timeZone)
  const previousDate = addUtcDays(localDate, -1)
  const previousAssignment = findJourneyAssignmentForDate(assignments, previousDate)

  if (
    previousAssignment?.journey.nightShift &&
    getLocalMinutes(value, timeZone) < NIGHT_SHIFT_CARRYOVER_MINUTES
  ) {
    return previousDate
  }

  return localDate
}

function getLocalMinutes(value: Date, timeZone = "America/Sao_Paulo") {
  const { hours, minutes } = getLocalTimeParts(value, timeZone)

  return hours * 60 + minutes
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
  const minutes = Number(parts.find((part) => part.type === "minute")?.value ?? "0")

  return { hours, minutes }
}

function getComparableRecordedAtForWorkday(
  workdayDate: Date,
  recordedAt: Date,
  isNightShift: boolean,
  timeZone?: string
) {
  if (!isNightShift) {
    return recordedAt
  }

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

function shouldTreatEntriesAsOvernight(entries: TimeEntry[], timeZone?: string) {
  const localMinutes = entries.map((entry) => getLocalMinutes(entry.recordedAt, timeZone))
  const hasLateEntry = localMinutes.some((minutes) => minutes >= 18 * 60)
  const hasEarlyEntry = localMinutes.some((minutes) => minutes < NIGHT_SHIFT_CARRYOVER_MINUTES)

  return hasLateEntry && hasEarlyEntry
}

function addUtcDays(value: Date, amount: number) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + amount))
}

function getStoredDateOnly(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  )
}

function makeSyntheticWorkdayId(date: Date) {
  return -date.getTime()
}
