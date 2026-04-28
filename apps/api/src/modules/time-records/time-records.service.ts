import type { TimeEntry, Workday } from '@prisma/client';

import {
  toTimeEntryKind,
  type TimeEntryKind,
  type TimeEntrySource,
} from '../../common/constants/domain-enums.js';
import { prisma } from '../../lib/prisma.js';
import { calculateWorkedMinutes } from '../../common/utils/time-records.js';
import { getDateOnly } from '../../common/utils/date.js';

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

export function serializeWorkday(workday: Workday & { timeEntries?: TimeEntry[] }) {
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
