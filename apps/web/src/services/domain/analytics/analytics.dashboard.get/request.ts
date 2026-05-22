export const ANALYTICS_PERIOD_VALUES = [
  "today",
  "last7Days",
  "last30Days",
  "currentMonth",
  "custom",
] as const

export type AnalyticsPeriod = (typeof ANALYTICS_PERIOD_VALUES)[number]

export interface AnalyticsDashboardRequest {
  companyId?: number
  period?: AnalyticsPeriod
  from?: string
  to?: string
}
