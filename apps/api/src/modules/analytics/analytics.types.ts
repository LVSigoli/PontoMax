export const ANALYTICS_PERIODS = [
  "today",
  "last7Days",
  "last30Days",
  "currentMonth",
  "custom",
] as const

export const DEFAULT_ANALYTICS_PERIOD = "last7Days"

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]

export interface AnalyticsDashboardParams {
  companyId?: number
  period?: AnalyticsPeriod
  from?: string
  to?: string
}
