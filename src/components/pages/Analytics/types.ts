export type AnalyticsMetricType = "present" | "extra-hours" | "pending" | "issues"

export interface AnalyticsMetric {
  label: string
  data: string
  type: AnalyticsMetricType
  subtitle: string
}

export interface EmployeeHourBalance {
  id: number
  name: string
  balance: string
  status: "positive" | "negative" | "neutral"
}

export interface SolicitationChartItem {
  label: string
  refused: number
  pending: number
  approved: number
}

export interface WorkedHoursItem {
  label: string
  hours: number
}
