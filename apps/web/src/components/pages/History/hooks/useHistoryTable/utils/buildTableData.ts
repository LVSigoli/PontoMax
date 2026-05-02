import type { TableRowData } from "@/components/structure/Table/types"
import type { WorkdaySummary } from "@/components/pages/PointRegister/types"

import { formatWorkdayDate, getPointStatusClass } from "@/components/pages/PointRegister/utils"

export function buildTableData(historyRecords: WorkdaySummary[]): TableRowData[] {
  return historyRecords.map((record) => ({
    Data: {
      value: formatWorkdayDate(record.workdayDate),
    },
    Registros: {
      value: record.recordsCount,
    },
    "Horas trabalhadas": {
      value: record.workedHours,
    },
    "Horas extras": {
      value: record.extraHours,
    },
    "Horas faltantes": {
      value: record.missingHours,
    },
    Status: {
      value: record.status,
      type: "badge",
      color: getPointStatusClass(record.status),
    },
  }))
}
