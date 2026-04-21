// Components
import { TableActions } from "../TableActions"
import { TableCell } from "../TableCell"

// Types
import type { Props as TableProps, TableRowData } from "../../types"

interface Props<T extends TableRowData> extends Pick<
  TableProps<T>,
  | "actions"
  | "allowActions"
  | "data"
  | "emptyMessage"
  | "getRowKey"
  | "onActionClick"
  | "onCellChange"
  | "onRowSelect"
> {
  columns: Array<keyof T>
}

export const TableBody = <T extends TableRowData>({
  data,
  columns,
  actions = [],
  allowActions = false,
  emptyMessage = "Nenhum registro encontrado",
  getRowKey,
  onRowSelect,
  onActionClick,
  onCellChange,
}: Props<T>) => {
  const shouldRenderActions = allowActions && actions.length > 0

  if (!data.length) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={(columns.length || 1) + (shouldRenderActions ? 1 : 0)}
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
          className={`border-b border-border-subtle last:border-b-0 ${
            onRowSelect ? "cursor-pointer transition hover:bg-surface-muted" : ""
          }`}
          onClick={() => onRowSelect?.(row)}
        >
          {columns.map((column) => (
            <td key={String(column)} className="px-3 py-4">
              {row[column] ? (
                <TableCell
                  cell={row[column]}
                  cellKey={column}
                  row={row}
                  onChange={onCellChange}
                />
              ) : null}
            </td>
          ))}

          {shouldRenderActions ? (
            <td className="px-3 py-4 text-right">
              <TableActions
                actions={actions}
                row={row}
                handleActionClick={onActionClick}
              />
            </td>
          ) : null}
        </tr>
      ))}
    </tbody>
  )
}
