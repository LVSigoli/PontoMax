import { WorkdaySummary } from "@/components/pages/PointRegister/types"
import {
  formatPointLocation,
  getPointStatusClass,
} from "@/components/pages/PointRegister/utils"

export function buildTableData(record: WorkdaySummary | null) {
  if (!record) return []

  return record.records.map((item) => ({
    Horario: { value: item.time },
    Tipo: { value: item.type },
    Localizacao: { value: formatPointLocation(item.location ?? null) },
    Status: {
      value: item.status,
      type: "badge",
      color: getPointStatusClass(item.status),
    } as const,
  }))
}
