import { WorkdaySummary } from "@/components/pages/PointRegister/types"

export function buildTableData(record: WorkdaySummary | null) {
  if (!record) return []

  return record.records.map((item) => ({
    Horario: { value: item.time },
    Tipo: { value: item.type },
    Status: { value: item.status, type: "badge" } as const,
  }))
}
