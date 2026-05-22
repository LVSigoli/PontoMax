import type { SelectionOption } from "@/components/structure/Select/types"
import type { AnalyticsPeriod } from "@/services/domain"

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = "last7Days"

export const ANALYTICS_PERIOD_OPTIONS: SelectionOption[] = [
  { value: "today", label: "Hoje" },
  { value: "last7Days", label: "Ultimos 7 dias" },
  { value: "last30Days", label: "Ultimos 30 dias" },
  { value: "currentMonth", label: "Mes atual" },
  { value: "custom", label: "Personalizado" },
]
