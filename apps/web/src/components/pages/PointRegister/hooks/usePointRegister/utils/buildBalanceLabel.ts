import type { WorkdayApiItem } from "@/services/domain"
import { formatMinutes } from "@/services/utils"

export function buildBalanceLabel(workday: WorkdayApiItem | null) {
  if (!workday || workday.timeEntries.length === 0) {
    return "Aguardando registros"
  }

  const balanceMinutes = workday.workedMinutes - workday.scheduledMinutes

  if (balanceMinutes >= 0) {
    return `Saldo positivo ${formatMinutes(balanceMinutes)}`
  }

  return `Faltam ${formatMinutes(Math.abs(balanceMinutes))}`
}
