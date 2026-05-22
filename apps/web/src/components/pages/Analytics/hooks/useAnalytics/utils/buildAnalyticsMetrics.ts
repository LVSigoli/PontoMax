import { AnalyticsDashboardResponse } from "@/services/domain"
import { formatHoursWithMinutes } from "@/services/utils"
import { AnalyticsMetric } from "../../../types"

interface BuildAnalyticsMetricsOptions {
  isSingleDayRange: boolean
}

export function buildAnalyticsMetrics(
  dashboard: AnalyticsDashboardResponse,
  options: BuildAnalyticsMetricsOptions
): AnalyticsMetric[] {
  const rangeLabel = options.isSingleDayRange ? "hoje" : "no periodo"
  const presenceLabel = options.isSingleDayRange
    ? "Colaboradores presentes hoje"
    : "Colaboradores com registros no periodo"
  const presenceSubtitle = options.isSingleDayRange
    ? "Quantidade de colaboradores ativos que registraram entrada hoje"
    : "Quantidade de colaboradores ativos que registraram entrada no intervalo selecionado"

  return [
    {
      label: presenceLabel,
      data: `${dashboard.metrics.presentEmployees}/${dashboard.metrics.companyEmployees}`,
      type: "present",
      subtitle: presenceSubtitle,
    },
    {
      label: `Atrasos ${rangeLabel}`,
      data: `${dashboard.metrics.lateWorkdays} registros`,
      type: "late",
      subtitle: "Colaboradores com entrada ou saida fora da tolerancia",
    },
    {
      label: `Horas extras ${rangeLabel}`,
      data: formatHoursWithMinutes(dashboard.metrics.overtimeMinutes),
      type: "extra-hours",
      subtitle: "Total acumulado de horas extras da equipe no intervalo selecionado",
    },
    {
      label: `Ajustes pendentes ${rangeLabel}`,
      data: `${dashboard.metrics.pendingAdjustments} solicitacoes`,
      type: "pending",
      subtitle: "Solicitacoes de correcao aguardando aprovacao no intervalo selecionado",
    },
    {
      label: `Inconsistencias ${rangeLabel}`,
      data: `${dashboard.metrics.inconsistentWorkdays} registros`,
      type: "issues",
      subtitle: "Casos com falta de registros ou jornadas incompletas no intervalo selecionado",
    },
  ]
}
