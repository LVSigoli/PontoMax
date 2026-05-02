import type { PickerType } from "@/components/structure/Picker/types"
import type {
  TableCellData,
  TableCellRenderData,
  TableCellType,
} from "../../types"

export function normalizeTableCell(cell: TableCellData): TableCellRenderData {
  return {
    ...cell,
    type: cell.type ?? cell.tipo ?? "text",
    value: cell.value ?? cell.valor ?? "",
  }
}

export function getTablePickerType(type: TableCellType): PickerType {
  if (type === "data-picker" || type === "date-picker") return "date"
  if (type === "date-time-picker") return "dateTime"

  return "time"
}

export function getCellStringValue(value: TableCellRenderData["value"]) {
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value

  return ""
}
