import { WorkdaySummary } from "@/components/pages/PointRegister/types"
import { formatWorkdayDate } from "@/components/pages/PointRegister/utils"

export function getTextLabel(record: WorkdaySummary | null) {
  if (!record) return "Selecione um registro para visualizar"
  return `Resumo de ${formatWorkdayDate(record.workdayDate, { withYear: true })}`
}
