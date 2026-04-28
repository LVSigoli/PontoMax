import type { Journey, TimeEntry, UserJourneyAssignment, Workday } from '@prisma/client';

import {
  toTimeEntryKind,
  type TimeEntryKind,
  type TimeEntrySource,
} from '../../common/constants/domain-enums.js';
import { prisma } from '../../lib/prisma.js';
import { calculateWorkedMinutes } from '../../common/utils/time-records.js';
import { getDateOnly } from '../../common/utils/date.js';

type JourneyAssignmentWithJourney = UserJourneyAssignment & {
  journey: Journey;
};

type WorkdayLike = Pick<
  Workday,
  | 'id'
  | 'date'
  | 'status'
  | 'scheduledMinutes'
  | 'workedMinutes'
  | 'overtimeMinutes'
  | 'missingMinutes'
  | 'nightMinutes'
  | 'isHoliday'
> & {
  timeEntries?: TimeEntry[];
};

interface WorkdayOverviewSummary {
  workedDays: number;
  balanceMinutes: number;
  inconsistentCount: number;
}

export interface WorkdayOverviewResponse {
  items: Array<ReturnType<typeof serializeWorkday>>;
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: WorkdayOverviewSummary;
}

function mapWorkedStatus(params: {
  totalEntries: number;
  workedMinutes: number;
  scheduledMinutes: number;
}) {
  const { totalEntries, workedMinutes, scheduledMinutes } = params;

  if (totalEntries === 0 || totalEntries % 2 !== 0) {
    return 'INCONSISTENT' as const;
  }

  if (workedMinutes > scheduledMinutes) {
    return 'CLOSED' as const;
  }

  return 'CLOSED' as const;
}

export async function ensureWorkday(params: {
  companyId: number;
  userId: number;
  date: Date;
  timezone?: string;
}) {
  const date = getDateOnly(params.date, params.timezone);
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
      validFrom: 'desc',
    },
  });

  const holiday = await prisma.holiday.findFirst({
    where: {
      companyId: params.companyId,
      date,
      isActive: true,
    },
  });

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
  });
}

export async function getTodayWorkdaySnapshot(params: {
  companyId: number;
  userId: number;
  timezone?: string;
}) {
  const date = getDateOnly(new Date(), params.timezone);
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
      validFrom: 'desc',
    },
  });

  const holiday = await prisma.holiday.findFirst({
    where: {
      companyId: params.companyId,
      date,
      isActive: true,
    },
  });

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
          status: 'ACTIVE',
        },
        orderBy: {
          recordedAt: 'asc',
        },
      },
    },
  });

  if (workday) {
    return serializeWorkday(workday);
  }

  const scheduledMinutes = assignment?.journey.dailyWorkMinutes ?? 0;

  return serializeWorkday({
    id: makeSyntheticWorkdayId(date),
    date,
    status: 'OPEN',
    scheduledMinutes,
    workedMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: scheduledMinutes,
    nightMinutes: 0,
    isHoliday: Boolean(holiday),
    timeEntries: [],
  });
}

export async function getWorkdayOverview(params: {
  companyId: number;
  userId: number;
  page: number;
  pageSize: number;
  timezone?: string;
}): Promise<WorkdayOverviewResponse> {
  const today = getDateOnly(new Date(), params.timezone);
  const assignments = await prisma.userJourneyAssignment.findMany({
    where: {
      userId: params.userId,
      validFrom: {
        lt: today,
      },
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: 'asc',
    },
  });

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
          status: 'ACTIVE',
        },
        orderBy: {
          recordedAt: 'asc',
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (assignments.length === 0 && workdays.length === 0) {
    return {
      items: [],
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems: 0,
        totalPages: 0,
      },
      summary: {
        workedDays: 0,
        balanceMinutes: 0,
        inconsistentCount: 0,
      },
    };
  }

  const overviewStartDate = getOverviewStartDate(assignments, workdays);

  if (!overviewStartDate) {
    return {
      items: [],
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems: 0,
        totalPages: 0,
      },
      summary: {
        workedDays: 0,
        balanceMinutes: 0,
        inconsistentCount: 0,
      },
    };
  }

  const holidays = await prisma.holiday.findMany({
    where: {
      companyId: params.companyId,
      isActive: true,
      date: {
        gte: overviewStartDate,
        lt: today,
      },
    },
  });

  const holidayKeys = new Set(holidays.map((holiday) => getDateKey(holiday.date)));
  const workdayByKey = new Map(workdays.map((workday) => [getDateKey(workday.date), workday]));
  const overviewKeys = new Set(workdays.map((workday) => getDateKey(workday.date)));
  const yesterday = addDays(today, -1);

  for (const assignment of assignments) {
    const validFrom = getDateOnly(assignment.validFrom);
    const validTo = assignment.validTo ? getDateOnly(assignment.validTo) : yesterday;
    const rangeStart = validFrom > overviewStartDate ? validFrom : overviewStartDate;
    const rangeEnd = validTo < yesterday ? validTo : yesterday;

    if (rangeStart > rangeEnd) {
      continue;
    }

    for (let date = rangeStart; date <= rangeEnd; date = addDays(date, 1)) {
      const dateKey = getDateKey(date);

      if (holidayKeys.has(dateKey)) {
        continue;
      }

      if (isScheduledWorkday(assignment, date)) {
        overviewKeys.add(dateKey);
      }
    }
  }

  const orderedKeys = [...overviewKeys].sort((left, right) => right.localeCompare(left));
  const totalItems = orderedKeys.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(params.page, totalPages);
  const startIndex = (safePage - 1) * params.pageSize;
  const pageKeys = orderedKeys.slice(startIndex, startIndex + params.pageSize);

  const summary = buildOverviewSummary({
    orderedKeys,
    workdayByKey,
    assignments,
  });

  return {
    items: pageKeys.map((dateKey) =>
      serializeWorkday(resolveOverviewWorkdaySnapshot(dateKey, workdayByKey, assignments))
    ),
    meta: {
      page: safePage,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
    summary,
  };
}

export async function recalculateWorkday(workdayId: number) {
  const workday = await prisma.workday.findUniqueOrThrow({
    where: { id: workdayId },
    include: {
      timeEntries: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          recordedAt: 'asc',
        },
      },
    },
  });

  const workedMinutes = calculateWorkedMinutes(
    workday.timeEntries.map((entry) => ({
      kind: toTimeEntryKind(entry.kind),
      recordedAt: entry.recordedAt,
    })),
  );
  const overtimeMinutes = Math.max(0, workedMinutes - workday.scheduledMinutes);
  const missingMinutes = Math.max(0, workday.scheduledMinutes - workedMinutes);
  const status = mapWorkedStatus({
    totalEntries: workday.timeEntries.length,
    workedMinutes,
    scheduledMinutes: workday.scheduledMinutes,
  });

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
          status: 'ACTIVE',
        },
        orderBy: {
          recordedAt: 'asc',
        },
      },
    },
  });
}

export async function createTimeEntry(params: {
  companyId: number;
  userId: number;
  recordedAt: Date;
  source: TimeEntrySource;
  kind?: TimeEntryKind;
  timezone?: string;
}) {
  const workday = await ensureWorkday({
    companyId: params.companyId,
    userId: params.userId,
    date: params.recordedAt,
    timezone: params.timezone,
  });

  const existingActiveEntries = await prisma.timeEntry.findMany({
    where: {
      workdayId: workday.id,
      status: 'ACTIVE',
    },
    orderBy: {
      sequence: 'asc',
    },
  });

  const kind =
    params.kind ?? (existingActiveEntries.length % 2 === 0 ? ('ENTRY' as const) : ('EXIT' as const));

  const createdEntry = await prisma.timeEntry.create({
    data: {
      workdayId: workday.id,
      userId: params.userId,
      recordedAt: params.recordedAt,
      source: params.source,
      kind,
      sequence: existingActiveEntries.length + 1,
      timezone: params.timezone ?? 'America/Sao_Paulo',
    },
  });

  const updatedWorkday = await recalculateWorkday(workday.id);

  return {
    workday: updatedWorkday,
    entry: createdEntry,
  };
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
  };
}

export function serializeWorkday(workday: WorkdayLike) {
  return {
    id: workday.id,
    date: workday.date,
    status: workday.status,
    scheduledMinutes: workday.scheduledMinutes,
    workedMinutes: workday.workedMinutes,
    overtimeMinutes: workday.overtimeMinutes,
    missingMinutes: workday.missingMinutes,
    nightMinutes: workday.nightMinutes,
    isHoliday: workday.isHoliday,
    timeEntries: workday.timeEntries?.map(serializeTimeEntry) ?? [],
  };
}

function resolveOverviewWorkdaySnapshot(
  dateKey: string,
  workdayByKey: Map<string, Workday & { timeEntries: TimeEntry[] }>,
  assignments: JourneyAssignmentWithJourney[],
): WorkdayLike {
  const existingWorkday = workdayByKey.get(dateKey);

  if (existingWorkday) {
    return existingWorkday;
  }

  const date = parseDateKey(dateKey);
  const assignment = findJourneyAssignmentForDate(assignments, date);
  const scheduledMinutes = assignment?.journey.dailyWorkMinutes ?? 0;

  return {
    id: makeSyntheticWorkdayId(date),
    date,
    status: 'INCONSISTENT',
    scheduledMinutes,
    workedMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: scheduledMinutes,
    nightMinutes: 0,
    isHoliday: false,
    timeEntries: [],
  };
}

function buildOverviewSummary(params: {
  orderedKeys: string[];
  workdayByKey: Map<string, Workday & { timeEntries: TimeEntry[] }>;
  assignments: JourneyAssignmentWithJourney[];
}): WorkdayOverviewSummary {
  return params.orderedKeys.reduce<WorkdayOverviewSummary>(
    (summary, dateKey) => {
      const workday = resolveOverviewWorkdaySnapshot(
        dateKey,
        params.workdayByKey,
        params.assignments,
      );

      if (workday.workedMinutes > 0) {
        summary.workedDays += 1;
      }

      summary.balanceMinutes += workday.overtimeMinutes - workday.missingMinutes;

      if (workday.status === 'INCONSISTENT' || workday.status === 'PENDING_ADJUSTMENT') {
        summary.inconsistentCount += 1;
      }

      return summary;
    },
    {
      workedDays: 0,
      balanceMinutes: 0,
      inconsistentCount: 0,
    },
  );
}

function getOverviewStartDate(
  assignments: JourneyAssignmentWithJourney[],
  workdays: Workday[],
) {
  const earliestAssignmentDate = assignments[0]?.validFrom ? getDateOnly(assignments[0].validFrom) : null;
  const earliestWorkdayDate = workdays.length > 0 ? getDateOnly(workdays.at(-1)!.date) : null;

  if (!earliestAssignmentDate) {
    return earliestWorkdayDate;
  }

  if (!earliestWorkdayDate) {
    return earliestAssignmentDate;
  }

  return earliestAssignmentDate < earliestWorkdayDate ? earliestAssignmentDate : earliestWorkdayDate;
}

function findJourneyAssignmentForDate(assignments: JourneyAssignmentWithJourney[], date: Date) {
  const dateTime = date.getTime();

  for (let index = assignments.length - 1; index >= 0; index -= 1) {
    const assignment = assignments[index];
    const validFrom = getDateOnly(assignment.validFrom).getTime();
    const validTo = assignment.validTo ? getDateOnly(assignment.validTo).getTime() : null;

    if (validFrom <= dateTime && (validTo === null || validTo >= dateTime)) {
      return assignment;
    }
  }

  return null;
}

function isScheduledWorkday(assignment: JourneyAssignmentWithJourney, date: Date) {
  const scaleCode = assignment.journey.scaleCode.trim().toUpperCase();

  if (scaleCode === '5X2') {
    const weekday = date.getUTCDay();
    return weekday >= 1 && weekday <= 5;
  }

  if (scaleCode === '6X1') {
    return date.getUTCDay() !== 0;
  }

  if (scaleCode === '12X36') {
    return diffInDays(getDateOnly(assignment.validFrom), date) % 2 === 0;
  }

  const cycleMatch = scaleCode.match(/^(\d+)X(\d+)$/);

  if (!cycleMatch) {
    return false;
  }

  const workDays = Number(cycleMatch[1]);
  const offDays = Number(cycleMatch[2]);

  if (workDays <= 0 || offDays <= 0 || workDays > 7 || offDays > 7) {
    return false;
  }

  const cycleLength = workDays + offDays;
  const dayIndex = diffInDays(getDateOnly(assignment.validFrom), date) % cycleLength;

  return dayIndex < workDays;
}

function addDays(date: Date, value: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + value);
  return nextDate;
}

function diffInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function makeSyntheticWorkdayId(date: Date) {
  return -date.getTime();
}
