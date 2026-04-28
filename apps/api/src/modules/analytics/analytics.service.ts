import { subDays } from './date-helpers.js';

import { prisma } from '../../lib/prisma.js';
import { startOfDay } from '../../common/utils/date.js';

function getDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatWeekdayLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(value);
}

function formatShortDayLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    weekday: 'short',
  })
    .format(value)
    .replace(',', '');
}

export async function getAnalyticsDashboard(companyId?: number) {
  const today = startOfDay(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const sixDaysAgo = subDays(today, 5);
  const fourDaysAgo = subDays(today, 4);

  const [companyEmployees, todayWorkdays, monthlyWorkdays, monthlyAdjustments, recentAdjustments] =
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
          date: {
            gte: today,
          },
        },
        include: {
          user: true,
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: {
            gte: monthStart,
          },
        },
        include: {
          user: true,
        },
      }),
      prisma.adjustmentRequest.findMany({
        where: {
          companyId: companyId ?? undefined,
          requestedAt: {
            gte: sixDaysAgo,
          },
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: {
            gte: fourDaysAgo,
          },
        },
      }),
    ]);

  const presentEmployees = todayWorkdays.filter((workday) => workday.workedMinutes > 0).length;
  const overtimeMinutes = monthlyWorkdays.reduce(
    (total, workday) => total + workday.overtimeMinutes,
    0,
  );
  const inconsistentWorkdays = monthlyWorkdays.filter(
    (workday) => workday.status === 'INCONSISTENT' || workday.status === 'PENDING_ADJUSTMENT',
  ).length;
  const pendingAdjustments = monthlyAdjustments.filter(
    (adjustment) => adjustment.status === 'PENDING',
  ).length;

  const balanceByUser = new Map<
    number,
    {
      id: number;
      name: string;
      balanceMinutes: number;
    }
  >();

  for (const workday of monthlyWorkdays) {
    const current = balanceByUser.get(workday.userId) ?? {
      id: workday.userId,
      name: workday.user.fullName,
      balanceMinutes: 0,
    };

    current.balanceMinutes += workday.overtimeMinutes - workday.missingMinutes;
    balanceByUser.set(workday.userId, current);
  }

  const balances = [...balanceByUser.values()]
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
    const date = subDays(today, 5 - index);
    adjustmentsByDay.set(getDateKey(date), {
      approved: 0,
      pending: 0,
      refused: 0,
    });
  }

  for (const adjustment of monthlyAdjustments) {
    const key = getDateKey(startOfDay(adjustment.requestedAt));
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

  const workedHoursByDay = new Map<string, { totalMinutes: number; count: number }>();

  for (let index = 0; index < 5; index += 1) {
    const date = subDays(today, 4 - index);
    workedHoursByDay.set(getDateKey(date), {
      totalMinutes: 0,
      count: 0,
    });
  }

  for (const workday of recentAdjustments) {
    const key = getDateKey(startOfDay(workday.date));
    const bucket = workedHoursByDay.get(key);

    if (!bucket) {
      continue;
    }

    bucket.totalMinutes += workday.workedMinutes;
    bucket.count += 1;
  }

  const workedHours = [...workedHoursByDay.entries()].map(([key, bucket]) => ({
    label: formatWeekdayLabel(new Date(`${key}T00:00:00`)),
    hours:
      bucket.count === 0 ? 0 : Number((bucket.totalMinutes / bucket.count / 60).toFixed(1)),
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
