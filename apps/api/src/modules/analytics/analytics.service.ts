import { endOfDay, getDateOnly, startOfDay } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { subDays } from "./date-helpers.js"
import {
  DEFAULT_ANALYTICS_PERIOD,
  type AnalyticsDashboardParams,
  type AnalyticsPeriod,
} from "./analytics.types.js"

type AnalyticsRange = {
  from: Date
  period: AnalyticsPeriod
  to: Date
}

type BalanceEntry = {
  balanceMinutes: number
  id: number
  name: string
}

function getDateKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addDays(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + amount
    )
  )
}

function getRangeLength(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1
}

function listRangeDates(from: Date, to: Date) {
  const dates: Date[] = []

  for (
    let current = from;
    current.getTime() <= to.getTime();
    current = addDays(current, 1)
  ) {
    dates.push(current)
  }

  return dates
}

function formatChartLabel(value: Date, totalDays: number) {
  if (totalDays <= 7) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      weekday: "short",
    })
      .format(value)
      .replace(",", "")
      .replaceAll(".", "")
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value)
}

function resolveAnalyticsRange(
  params: AnalyticsDashboardParams = {}
): AnalyticsRange {
  const today = getDateOnly(new Date())
  const period = params.period ?? DEFAULT_ANALYTICS_PERIOD

  if (period === "today") {
    return {
      from: today,
      period,
      to: today,
    }
  }

  if (period === "last30Days") {
    return {
      from: subDays(today, 29),
      period,
      to: today,
    }
  }

  if (period === "currentMonth") {
    return {
      from: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
      period,
      to: today,
    }
  }

  if (period === "custom" && params.from && params.to) {
    return {
      from: getDateOnly(params.from),
      period,
      to: getDateOnly(params.to),
    }
  }

  return {
    from: subDays(today, 6),
    period: DEFAULT_ANALYTICS_PERIOD,
    to: today,
  }
}

export async function getAnalyticsDashboard(
  params: AnalyticsDashboardParams = {}
) {
  const range = resolveAnalyticsRange(params)
  const totalDays = getRangeLength(range.from, range.to)

  const [activeUsers, workdays, adjustments] = await Promise.all([
    prisma.user.findMany({
      where: {
        companyId: params.companyId ?? undefined,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    }),
    prisma.workday.findMany({
      where: {
        companyId: params.companyId ?? undefined,
        date: {
          gte: range.from,
          lte: range.to,
        },
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    }),
    prisma.adjustmentRequest.findMany({
      where: {
        companyId: params.companyId ?? undefined,
        requestedAt: {
          gte: startOfDay(range.from),
          lte: endOfDay(range.to),
        },
      },
    }),
  ])

  const companyEmployees = activeUsers.length
  const presentEmployees = new Set(
    workdays
      .filter((workday) =>
        workday.timeEntries.some((entry) => entry.kind === "ENTRY")
      )
      .map((workday) => workday.userId)
  ).size
  const lateWorkdays = workdays.filter(
    (workday) => workday.status === "LATE"
  ).length
  const overtimeMinutes = workdays.reduce(
    (total, workday) => total + workday.overtimeMinutes,
    0
  )
  const pendingAdjustments = adjustments.filter(
    (adjustment) => adjustment.status === "PENDING"
  ).length
  const inconsistentWorkdays = workdays.filter(
    (workday) =>
      workday.status === "INCONSISTENT" ||
      workday.status === "PENDING_ADJUSTMENT" ||
      workday.status === "REJECTED"
  ).length

  const balancesByUser = new Map<number, BalanceEntry>(
    activeUsers.map((user) => [
      user.id,
      {
        balanceMinutes: 0,
        id: user.id,
        name: user.fullName,
      },
    ])
  )

  for (const workday of workdays) {
    const balance = balancesByUser.get(workday.userId)

    if (!balance) {
      continue
    }

    balance.balanceMinutes += workday.overtimeMinutes - workday.missingMinutes
  }

  const balances = [...balancesByUser.values()]
    .sort(
      (left, right) =>
        right.balanceMinutes - left.balanceMinutes ||
        left.name.localeCompare(right.name, "pt-BR")
    )
    .slice(0, 7)

  const rangeDates = listRangeDates(range.from, range.to)
  const solicitationBuckets = new Map(
    rangeDates.map((date) => [
      getDateKey(date),
      {
        approved: 0,
        pending: 0,
        refused: 0,
      },
    ])
  )

  for (const adjustment of adjustments) {
    const key = getDateKey(getDateOnly(adjustment.requestedAt))
    const bucket = solicitationBuckets.get(key)

    if (!bucket) {
      continue
    }

    if (adjustment.status === "APPROVED") {
      bucket.approved += 1
      continue
    }

    if (adjustment.status === "PENDING") {
      bucket.pending += 1
      continue
    }

    if (adjustment.status === "REJECTED") {
      bucket.refused += 1
    }
  }

  const workedHoursBuckets = new Map(
    rangeDates.map((date) => [
      getDateKey(date),
      {
        totalMinutes: 0,
      },
    ])
  )

  for (const workday of workdays) {
    const bucket = workedHoursBuckets.get(getDateKey(workday.date))

    if (!bucket) {
      continue
    }

    bucket.totalMinutes += workday.workedMinutes
  }

  const solicitationChart = rangeDates.map((date) => {
    const key = getDateKey(date)
    const bucket = solicitationBuckets.get(key) ?? {
      approved: 0,
      pending: 0,
      refused: 0,
    }

    return {
      approved: bucket.approved,
      label: formatChartLabel(date, totalDays),
      pending: bucket.pending,
      refused: bucket.refused,
    }
  })

  const workedHours = rangeDates.map((date) => {
    const key = getDateKey(date)
    const bucket = workedHoursBuckets.get(key) ?? {
      totalMinutes: 0,
    }

    return {
      hours: Number((bucket.totalMinutes / 60).toFixed(1)),
      label: formatChartLabel(date, totalDays),
    }
  })

  return {
    metrics: {
      companyEmployees,
      inconsistentWorkdays,
      lateWorkdays,
      overtimeMinutes,
      pendingAdjustments,
      presentEmployees,
    },
    balances,
    solicitationChart,
    workedHours,
  }
}
