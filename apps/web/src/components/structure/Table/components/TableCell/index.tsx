// Components
import { TableInputCell } from "./components/TableInputCell"
import { TableSelectCell } from "./components/TableSelectCell"

// Types
import type { TableCellProps, TableRowData } from "../../types"

// Utils
import { normalizeTableCell } from "./utils"

export const TableCell = <T extends TableRowData>({
  cell,
  cellKey,
  row,
  onAction,
  onChange,
}: TableCellProps<T>) => {
  const normalizedCell = normalizeTableCell(cell)
  const colorClass = normalizedCell.color ?? "text-content-secondary"

  if (normalizedCell.type === "badge") {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}
      >
        {normalizedCell.value}
      </span>
    )
  }

  if (normalizedCell.type === "action" || normalizedCell.allowAction) {
    return (
      <button
        type="button"
        disabled={!normalizedCell.allowAction}
        onClick={(event) => {
          event.stopPropagation()
          onAction?.(row, cellKey)
        }}
        className={`text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${colorClass}`}
      >
        {normalizedCell.value}
      </button>
    )
  }

  if (
    normalizedCell.type === "input" ||
    normalizedCell.type === "data-picker" ||
    normalizedCell.type === "date-picker" ||
    normalizedCell.type === "time-picker" ||
    normalizedCell.type === "date-time-picker"
  ) {
    return (
      <TableInputCell
        cell={normalizedCell}
        onChange={(value) => onChange?.(row, cellKey, value)}
      />
    )
  }

  if (normalizedCell.type === "select") {
    return (
      <TableSelectCell
        cell={normalizedCell}
        onChange={(value) => onChange?.(row, cellKey, value)}
      />
    )
  }

  return <span className={`text-sm ${colorClass}`}>{normalizedCell.value}</span>
}
