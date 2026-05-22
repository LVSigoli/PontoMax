import type { AnalyticsPeriod } from "@/services/domain"

export interface AnalyticsDateRange {
  from: string
  to: string
}

export function resolveAnalyticsDateRange(
  period: AnalyticsPeriod,
  referenceDate = new Date()
): AnalyticsDateRange {
  const today = new Date(referenceDate)

  if (period === "today") {
    const value = buildDateInputValue(today)

    return {
      from: value,
      to: value,
    }
  }

  if (period === "last30Days") {
    return {
      from: buildDateInputValue(addDays(today, -29)),
      to: buildDateInputValue(today),
    }
  }

  if (period === "currentMonth") {
    return {
      from: buildDateInputValue(
        new Date(today.getFullYear(), today.getMonth(), 1)
      ),
      to: buildDateInputValue(today),
    }
  }

  return {
    from: buildDateInputValue(addDays(today, -6)),
    to: buildDateInputValue(today),
  }
}

function buildDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}
