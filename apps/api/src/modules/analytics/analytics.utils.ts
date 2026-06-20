import { getDateOnly } from "../../common/utils/date.js"
import { subDays } from "./date-helpers.js"
import {
  DEFAULT_ANALYTICS_PERIOD,
  type AnalyticsDashboardParams,
  type AnalyticsPeriod,
} from "./analytics.types.js"

export interface AnalyticsRange {
  from: Date
  period: AnalyticsPeriod
  to: Date
}

export function getAnalyticsDateKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function getRangeLength(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1
}

export function listRangeDates(from: Date, to: Date) {
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

export function formatChartLabel(value: Date, totalDays: number) {
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

export function resolveAnalyticsRange(
  params: AnalyticsDashboardParams = {}
): AnalyticsRange {
  const today = getDateOnly(new Date())
  const period = params.period ?? DEFAULT_ANALYTICS_PERIOD

  if (period === "today") {
    return { from: today, period, to: today }
  }

  if (period === "last30Days") {
    return { from: subDays(today, 29), period, to: today }
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

function addDays(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + amount
    )
  )
}
