import type {
  TableCellData,
  TableCellRenderData,
  TableCellType,
} from "../../types"

const INPUT_TYPE_BY_CELL_TYPE: Partial<Record<TableCellType, string>> = {
  "data-picker": "date",
  "date-picker": "date",
  "date-time-picker": "datetime-local",
  input: "text",
  "time-picker": "time",
}

export function normalizeTableCell(cell: TableCellData): TableCellRenderData {
  return {
    ...cell,
    type: cell.type ?? cell.tipo ?? "text",
    value: cell.value ?? cell.valor ?? "",
  }
}

export function getCellInputType(type: TableCellType) {
  return INPUT_TYPE_BY_CELL_TYPE[type] ?? "text"
}

export function getCellStringValue(value: TableCellRenderData["value"]) {
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value

  return ""
}
