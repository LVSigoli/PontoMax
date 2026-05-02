import type { SelectionOption } from "@/components/structure/Select/types"
import type { TableRowData } from "@/components/structure/Table/types"

import type { PointRecord } from "@/components/pages/PointRegister/types"

export function buildTableRows(
  records: PointRecord[],
  pointTypeOptions: SelectionOption[]
) {
  return records.map<TableRowData>((record) => ({
    Horario: {
      type: "time-picker",
      value: normalizeEditableTime(record.time),
      className: "w-24",
    },
    Tipo: {
      type: "select",
      value: record.type,
      options: pointTypeOptions,
      className: "w-32",
      color: record.type === "Entrada" ? "text-success-700" : "text-danger-700",
    },
  }))
}

function normalizeEditableTime(time: string) {
  const [hours = "00", minutes = "00"] = time.trim().split(":")
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
}
