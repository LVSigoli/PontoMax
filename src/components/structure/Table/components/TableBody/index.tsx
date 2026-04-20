// Components
import { TableCell } from "../TableCell"

// Types
import type { Props as TableProps, TableRowData } from "../../types"

interface Props<T extends TableRowData>
  extends Pick<TableProps<T>, "data" | "emptyMessage" | "getRowKey" | "onAction"> {
  columns: Array<keyof T>
}

export const TableBody = <T extends TableRowData>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
  getRowKey,
  onAction,
}: Props<T>) => {
  if (!data.length) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length || 1}
            className="px-3 py-8 text-center text-sm text-content-muted"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {data.map((row, rowIndex) => (
        <tr
          key={getRowKey?.(row, rowIndex) ?? rowIndex}
          className="border-b border-border-subtle last:border-b-0"
        >
          {columns.map((column) => (
            <td key={String(column)} className="px-3 py-4">
              {row[column] ? (
                <TableCell
                  cell={row[column]}
                  cellKey={column}
                  row={row}
                  onAction={onAction}
                />
              ) : null}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
