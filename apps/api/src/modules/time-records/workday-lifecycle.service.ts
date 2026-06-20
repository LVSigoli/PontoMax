import {
  calculateWorkedMinutes,
  isAlternatingTimeEntrySequence,
} from "../../common/utils/time-records.js"
import { prisma } from "../../lib/prisma.js"
import {
  buildComparableTimeEntries,
  calculateNightMinutes,
  getScheduledMinutesForDate,
  getStoredDateOnly,
  isLateWorkday,
  mapWorkedStatus,
  normalizeWorkdayDateInput,
  shouldTreatEntriesAsOvernight,
} from "./time-records.domain.js"
import { findApplicableHoliday } from "./time-records.repository.js"

export async function ensureWorkday(params: {
  companyId: number
  userId: number
  date: Date | string
  timezone?: string
}) {
  const date = normalizeWorkdayDateInput(params.date, params.timezone)
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
      scheduledMinutes,
    },
    create: {
      companyId: params.companyId,
      userId: params.userId,
      date,
      holidayId: holiday?.id ?? null,
      isHoliday: Boolean(holiday),
      scheduledMinutes,
    },
  })
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
  const timeZone = workday.timeEntries[0]?.timezone ?? "America/Sao_Paulo"
  const assignment = await prisma.userJourneyAssignment.findFirst({
    where: {
      userId: workday.userId,
      validFrom: { lte: workday.date },
      OR: [{ validTo: null }, { validTo: { gte: workday.date } }],
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "desc",
    },
  })
  const holiday = await findApplicableHoliday(
    workday.companyId,
    getStoredDateOnly(workday.date)
  )
  const isHoliday = Boolean(holiday)
  const scheduledMinutes = getScheduledMinutesForDate(
    assignment,
    getStoredDateOnly(workday.date),
    isHoliday
  )
  const treatAsNightShift =
    Boolean(assignment?.journey.nightShift) ||
    shouldTreatEntriesAsOvernight(workday.timeEntries, timeZone)
  const comparableTimeEntries = buildComparableTimeEntries({
    workdayDate: workday.date,
    entries: workday.timeEntries,
    isNightShift: treatAsNightShift,
    timeZone,
  })
  const isLate = isLateWorkday({
    assignment,
    entries: workday.timeEntries,
    scheduledMinutes,
    timeZone,
  })
  const workedMinutes = calculateWorkedMinutes(comparableTimeEntries)
  const nightMinutes = calculateNightMinutes(comparableTimeEntries)
  const overtimeMinutes = Math.max(0, workedMinutes - scheduledMinutes)
  const missingMinutes = Math.max(0, scheduledMinutes - workedMinutes)
  const status = mapWorkedStatus({
    totalEntries: workday.timeEntries.length,
    isLate,
    isSequenceValid: isAlternatingTimeEntrySequence(comparableTimeEntries),
  })

  return prisma.workday.update({
    where: { id: workdayId },
    data: {
      holidayId: holiday?.id ?? null,
      isHoliday,
      scheduledMinutes,
      workedMinutes,
      overtimeMinutes,
      missingMinutes,
      nightMinutes,
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
