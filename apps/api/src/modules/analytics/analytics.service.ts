import { endOfDay, getDateOnly, startOfDay } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { type AnalyticsDashboardParams } from "./analytics.types.js"
import {
  formatChartLabel,
  getAnalyticsDateKey,
  getRangeLength,
  listRangeDates,
  resolveAnalyticsRange,
} from "./analytics.utils.js"

type BalanceEntry = {
  balanceMinutes: number
  id: number
  name: string
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
      getAnalyticsDateKey(date),
      {
        approved: 0,
        pending: 0,
        refused: 0,
      },
    ])
  )

  for (const adjustment of adjustments) {
    const key = getAnalyticsDateKey(getDateOnly(adjustment.requestedAt))
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
      getAnalyticsDateKey(date),
      {
        totalMinutes: 0,
      },
    ])
  )

  for (const workday of workdays) {
    const bucket = workedHoursBuckets.get(getAnalyticsDateKey(workday.date))

    if (!bucket) {
      continue
    }

    bucket.totalMinutes += workday.workedMinutes
  }

  const solicitationChart = rangeDates.map((date) => {
    const key = getAnalyticsDateKey(date)
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
    const key = getAnalyticsDateKey(date)
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
