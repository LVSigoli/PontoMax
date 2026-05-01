import { WorkdayOverviewSummaryApiItem } from "@/services/domain"
import { formatMinutes } from "@/services/utils"
import { UserAnalysisItem } from "../../../types"

export function buildAnalysissItems(
  summary: WorkdayOverviewSummaryApiItem
): UserAnalysisItem[] {
  return [
    {
      label: "Dias trabalhados",
      data: `${summary.workedDays} dias`,
      type: "worked-days",
      subtitle: "Quantidade de dias trabalhados no periodo carregado",
    },
    {
      label: "Saldo de horas",
      data: formatMinutes(summary.balanceMinutes),
      type: "hour-balance",
      subtitle: "Total acumulado de horas extras e faltas",
    },
    {
      label: "Ajustes pendentes",
      data: `${summary.pendingAdjustments} solicitacoes`,
      type: "pending",
      subtitle: "Solicitacoes de correcao aguardando aprovacao",
    },
    {
      label: "Inconsistencias",
      data: `${summary.inconsistentCount} registros`,
      type: "issues",
      subtitle: "Casos com falta de registros ou jornadas incompletas",
    },
  ]
}
