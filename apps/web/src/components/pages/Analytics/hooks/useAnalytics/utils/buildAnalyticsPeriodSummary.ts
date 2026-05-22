import type { AnalyticsPeriod } from "@/services/domain"
import { formatDateLabel } from "@/services/utils"

interface AnalyticsDateRange {
  from: string
  to: string
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: "Hoje",
  last7Days: "Ultimos 7 dias",
  last30Days: "Ultimos 30 dias",
  currentMonth: "Mes atual",
  custom: "Personalizado",
}

export function buildAnalyticsPeriodSummary(
  period: AnalyticsPeriod,
  range: AnalyticsDateRange
) {
  const label = PERIOD_LABELS[period]

  if (range.from === range.to) {
    return `${label} · ${formatDateLabel(range.from)}`
  }

  return `${label} · ${formatDateLabel(range.from)} a ${formatDateLabel(
    range.to
  )}`
}
