import { subDays } from './date-helpers.js';

import { prisma } from '../../lib/prisma.js';
import { getDateOnly } from '../../common/utils/date.js';
import { getUserWorkdaySummary } from '../time-records/time-records.service.js';

function getDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatWeekdayLabel(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
  }).format(value);
}

function formatShortDayLabel(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    weekday: 'short',
  })
    .format(value)
    .replace(',', '');
}

export async function getAnalyticsDashboard(companyId?: number) {
  const today = getDateOnly(new Date());
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const sixCompletedDaysAgo = subDays(today, 6);
  const fiveCompletedDaysAgo = subDays(today, 5);

  const [companyEmployees, todayWorkdays, monthlyWorkdays, monthlyAdjustments, recentWorkdays, activeUsers] =
    await Promise.all([
      prisma.user.count({
        where: {
          companyId: companyId ?? undefined,
          isActive: true,
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: today,
        },
        include: {
          timeEntries: {
            where: {
              status: 'ACTIVE',
            },
          },
          user: true,
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: {
            gte: monthStart,
            lt: today,
          },
        },
      }),
      prisma.adjustmentRequest.findMany({
        where: {
          companyId: companyId ?? undefined,
          requestedAt: {
            gte: sixCompletedDaysAgo,
          },
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: {
            gte: fiveCompletedDaysAgo,
            lt: today,
          },
        },
      }),
      prisma.user.findMany({
        where: {
          companyId: companyId ?? undefined,
          isActive: true,
        },
        include: {
          company: {
            select: {
              timezone: true,
            },
          },
        },
      }),
    ]);

  const presentEmployees = todayWorkdays.filter((workday) =>
    workday.timeEntries.some((entry) => entry.kind === 'ENTRY'),
  ).length;
  const overtimeMinutes = monthlyWorkdays.reduce((total, workday) => total + workday.overtimeMinutes, 0);
  const inconsistentWorkdays = monthlyWorkdays.filter(
    (workday) => workday.status === 'INCONSISTENT' || workday.status === 'PENDING_ADJUSTMENT',
  ).length;
  const pendingAdjustments = monthlyAdjustments.filter(
    (adjustment) => adjustment.status === 'PENDING',
  ).length;

  const balances = (
    await Promise.all(
      activeUsers.map(async (user) => {
        const summary = await getUserWorkdaySummary({
          companyId: user.companyId,
          userId: user.id,
          timezone: user.company.timezone,
        });

        return {
          id: user.id,
          name: user.fullName,
          balanceMinutes: summary.balanceMinutes,
        };
      }),
    )
  )
    .sort((left, right) => right.balanceMinutes - left.balanceMinutes)
    .slice(0, 7);

  const adjustmentsByDay = new Map<
    string,
    {
      approved: number;
      pending: number;
      refused: number;
    }
  >();

  for (let index = 0; index < 6; index += 1) {
    const date = subDays(today, 6 - index);
    adjustmentsByDay.set(getDateKey(date), {
      approved: 0,
      pending: 0,
      refused: 0,
    });
  }

  for (const adjustment of monthlyAdjustments) {
    const key = getDateKey(getDateOnly(adjustment.requestedAt));
    const bucket = adjustmentsByDay.get(key);

    if (!bucket) {
      continue;
    }

    if (adjustment.status === 'APPROVED') {
      bucket.approved += 1;
      continue;
    }

    if (adjustment.status === 'PENDING') {
      bucket.pending += 1;
      continue;
    }

    if (adjustment.status === 'REJECTED') {
      bucket.refused += 1;
    }
  }

  const solicitationChart = [...adjustmentsByDay.entries()].map(([key, bucket]) => ({
    label: formatShortDayLabel(new Date(`${key}T00:00:00`)),
    approved: bucket.approved,
    pending: bucket.pending,
    refused: bucket.refused,
  }));

  const workedHoursByDay = new Map<string, { totalMinutes: number }>();

  for (let index = 0; index < 5; index += 1) {
    const date = subDays(today, 5 - index);
    workedHoursByDay.set(getDateKey(date), {
      totalMinutes: 0,
    });
  }

  for (const workday of recentWorkdays) {
    const key = getDateKey(workday.date);
    const bucket = workedHoursByDay.get(key);

    if (!bucket) {
      continue;
    }

    bucket.totalMinutes += workday.workedMinutes;
  }

  const workedHours = [...workedHoursByDay.entries()].map(([key, bucket]) => ({
    label: formatWeekdayLabel(new Date(`${key}T00:00:00`)),
    hours: Number((bucket.totalMinutes / 60).toFixed(1)),
  }));

  return {
    metrics: {
      presentEmployees,
      companyEmployees,
      overtimeMinutes,
      pendingAdjustments,
      inconsistentWorkdays,
    },
    balances,
    solicitationChart,
    workedHours,
  };
}
