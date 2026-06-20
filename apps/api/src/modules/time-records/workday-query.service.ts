import { endOfDay, getDateOnly, startOfDay } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import {
  addUtcDays,
  findJourneyAssignmentForDate,
  getDateKey,
  getScheduledMinutesForDate,
  getStoredDateOnly,
  makeSyntheticWorkdayId,
  minDate,
  normalizeWorkdayDateInput,
  normalizeWorkdayForTimezone,
  resolveEffectiveWorkdayDate,
  shouldIgnoreWorkdayInSummary,
} from "./time-records.domain.js"
import {
  findApplicableHoliday,
  getHolidayDateKeysForRange,
  getJourneyAssignmentsForRange,
} from "./time-records.repository.js"
import { serializeWorkday } from "./time-records.serializer.js"
import type {
  WorkdayLike,
  WorkdayOverviewResponse,
  WorkdayOverviewSummary,
} from "./time-records.types.js"

interface WorkdayQueryParams {
  companyId: number
  from?: Date | string
  to?: Date | string
  userId: number
  timezone?: string
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
  const date = resolveEffectiveWorkdayDate(
    new Date(),
    assignments,
    params.timezone
  )
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

  const holiday = await findApplicableHoliday(params.companyId, date)
  const scheduledMinutes = getScheduledMinutesForDate(
    assignment,
    date,
    Boolean(holiday)
  )

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
    if (
      workday.holidayId !== (holiday?.id ?? null) ||
      workday.isHoliday !== Boolean(holiday) ||
      workday.scheduledMinutes !== scheduledMinutes
    ) {
      const updatedWorkday = await prisma.workday.update({
        where: {
          id: workday.id,
        },
        data: {
          holidayId: holiday?.id ?? null,
          isHoliday: Boolean(holiday),
          scheduledMinutes,
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

      return serializeWorkday(
        normalizeWorkdayForTimezone(
          updatedWorkday,
          params.timezone,
          assignments
        )
      )
    }

    return serializeWorkday(
      normalizeWorkdayForTimezone(workday, params.timezone, assignments)
    )
  }

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

export async function getWorkdayOverview(
  params: WorkdayQueryParams & {
    page: number
    pageSize: number
  }
): Promise<WorkdayOverviewResponse> {
  const { assignments, workdays } = await getHistoricalWorkdays(params)
  const totalItems = workdays.length
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize)
  const startIndex = Math.max(0, (params.page - 1) * params.pageSize)
  const pageItems = workdays.slice(startIndex, startIndex + params.pageSize)

  return {
    items: pageItems.map((workday) =>
      serializeWorkday(
        normalizeWorkdayForTimezone(workday, params.timezone, assignments)
      )
    ),
    meta: {
      page: totalPages === 0 ? 1 : Math.min(params.page, totalPages),
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
  }
}

export async function getUserWorkdaySummary(
  params: WorkdayQueryParams
): Promise<WorkdayOverviewSummary> {
  const { assignments, workdays } = await getHistoricalWorkdays(params)
  const requestedFrom = params.from
    ? normalizeWorkdayDateInput(params.from, params.timezone)
    : undefined
  const requestedTo = params.to
    ? normalizeWorkdayDateInput(params.to, params.timezone)
    : undefined

  const pendingAdjustments = await prisma.adjustmentRequest.count({
    where: {
      companyId: params.companyId,
      requestedAt: {
        gte: requestedFrom ? startOfDay(requestedFrom) : undefined,
        lte: requestedTo ? endOfDay(requestedTo) : undefined,
      },
      userId: params.userId,
      status: "PENDING",
    },
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
  const workedDays = normalizedWorkdays.filter(
    (workday) =>
      !shouldIgnoreWorkdayInSummary(workday) &&
      workday.timeEntries?.some((entry) => entry.kind === "ENTRY")
  ).length
  const relevantWorkdays = normalizedWorkdays.filter(
    (workday) => !shouldIgnoreWorkdayInSummary(workday)
  )
  const summary = relevantWorkdays.reduce<
    Omit<WorkdayOverviewSummary, "pendingAdjustments">
  >(
    (currentSummary, workday) => {
      currentSummary.balanceMinutes +=
        workday.overtimeMinutes - workday.missingMinutes

      if (
        workday.status === "INCONSISTENT" ||
        workday.status === "PENDING_ADJUSTMENT" ||
        workday.status === "REJECTED"
      ) {
        currentSummary.inconsistentCount += 1
      }

      return currentSummary
    },
    {
      workedDays,
      balanceMinutes: 0,
      inconsistentCount: 0,
    }
  )

  return {
    ...summary,
    pendingAdjustments,
  }
}

async function getHistoricalWorkdays(params: WorkdayQueryParams) {
  const today = getDateOnly(new Date(), params.timezone)
  const defaultHistoryEndDate = addUtcDays(today, -1)
  const requestedFrom = params.from
    ? normalizeWorkdayDateInput(params.from, params.timezone)
    : null
  const requestedTo = params.to
    ? normalizeWorkdayDateInput(params.to, params.timezone)
    : null
  const historyEndDate =
    minDate(requestedTo, defaultHistoryEndDate) ?? defaultHistoryEndDate

  if (requestedFrom && requestedFrom.getTime() > historyEndDate.getTime()) {
    return {
      assignments: [],
      workdays: [],
    }
  }

  const [persistedWorkdays, assignments] = await Promise.all([
    prisma.workday.findMany({
      where: {
        userId: params.userId,
        date: {
          gte: requestedFrom ?? undefined,
          lte: historyEndDate,
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
    }),
    getJourneyAssignmentsForRange({
      userId: params.userId,
      from: requestedFrom ?? new Date(Date.UTC(1970, 0, 1)),
      to: historyEndDate,
    }),
  ])

  const earliestPersistedDate = persistedWorkdays.reduce<Date | null>(
    (current, workday) =>
      !current || workday.date.getTime() < current.getTime()
        ? workday.date
        : current,
    null
  )
  const earliestAssignmentDate = assignments[0]
    ? getStoredDateOnly(assignments[0].validFrom)
    : null
  const historyStartDate =
    requestedFrom ?? minDate(earliestPersistedDate, earliestAssignmentDate)

  if (
    !historyStartDate ||
    historyStartDate.getTime() > historyEndDate.getTime()
  ) {
    return {
      assignments,
      workdays: persistedWorkdays,
    }
  }

  const holidays = await getHolidayDateKeysForRange({
    companyId: params.companyId,
    from: historyStartDate,
    to: historyEndDate,
  })
  const holidayDateKeys = new Set(
    holidays.map((holiday) => getDateKey(getStoredDateOnly(holiday.date)))
  )
  const persistedWorkdaysByDate = new Map(
    persistedWorkdays.map((workday) => [
      getDateKey(getStoredDateOnly(workday.date)),
      workday,
    ])
  )
  const workdays: WorkdayLike[] = []

  for (
    let cursor = historyEndDate;
    cursor.getTime() >= historyStartDate.getTime();
    cursor = addUtcDays(cursor, -1)
  ) {
    const dateKey = getDateKey(cursor)
    const persistedWorkday = persistedWorkdaysByDate.get(dateKey)

    if (persistedWorkday) {
      workdays.push(persistedWorkday)
      continue
    }

    const assignment = findJourneyAssignmentForDate(assignments, cursor)
    const isHoliday = holidayDateKeys.has(dateKey)
    const scheduledMinutes = getScheduledMinutesForDate(
      assignment,
      cursor,
      isHoliday
    )

    if (scheduledMinutes <= 0) {
      continue
    }

    workdays.push({
      id: makeSyntheticWorkdayId(cursor),
      date: cursor,
      status: "INCONSISTENT",
      scheduledMinutes,
      workedMinutes: 0,
      overtimeMinutes: 0,
      missingMinutes: scheduledMinutes,
      nightMinutes: 0,
      isHoliday,
      timeEntries: [],
    })
  }

  return {
    assignments,
    workdays,
  }
}
