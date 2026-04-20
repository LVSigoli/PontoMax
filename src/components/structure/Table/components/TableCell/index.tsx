// Types
import type { TableCellProps, TableRowData } from "../../types"

export const TableCell = <T extends TableRowData>({
  cell,
  cellKey,
  row,
  onAction,
}: TableCellProps<T>) => {
  const colorClass = cell.color ?? "text-content-secondary"

  if (cell.tipo === "badge") {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}
      >
        {cell.valor}
      </span>
    )
  }

  if (cell.tipo === "action" || cell.allowAction) {
    return (
      <button
        type="button"
        disabled={!cell.allowAction}
        onClick={() => onAction?.(row, cellKey)}
        className={`text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${colorClass}`}
      >
        {cell.valor}
      </button>
    )
  }

  return <span className={`text-sm ${colorClass}`}>{cell.valor}</span>
}
