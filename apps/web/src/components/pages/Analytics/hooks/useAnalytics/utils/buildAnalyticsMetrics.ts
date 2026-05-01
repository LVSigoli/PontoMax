import { AnalyticsDashboardResponse } from "@/services/domain"
import { formatHoursWithMinutes } from "@/services/utils"
import { AnalyticsMetric } from "../../../types"

export function buildAnalyticsMetrics(
  dashboard: AnalyticsDashboardResponse
): AnalyticsMetric[] {
  return [
    {
      label: "Funcionarios presentes hoje",
      data: `${dashboard.metrics.presentEmployees}/${dashboard.metrics.companyEmployees}`,
      type: "present",
      subtitle: "Quantidade de funcionarios que ja registraram entrada hoje",
    },
    {
      label: "Horas extras da semana",
      data: formatHoursWithMinutes(dashboard.metrics.overtimeMinutes),
      type: "extra-hours",
      subtitle: "Total acumulado de horas extras da equipe",
    },
    {
      label: "Ajustes com pendencias",
      data: `${dashboard.metrics.pendingAdjustments} solicitacoes`,
      type: "pending",
      subtitle: "Solicitacoes de correcao aguardando aprovacao",
    },
    {
      label: "Inconsistencia de pontos",
      data: `${dashboard.metrics.inconsistentWorkdays} registros`,
      type: "issues",
      subtitle: "Casos com falta de registros ou jornadas incompletas",
    },
  ]
}
