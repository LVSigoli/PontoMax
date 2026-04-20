// Components
import { TableBody } from "./components/TableBody"
import { TableHeader } from "./components/TableHeader"

// Types
import type { Props, TableRowData } from "./types"

// Utils
import { getTableColumns } from "./utils"

export const Table = <T extends TableRowData>({
  data,
  emptyMessage,
  className = "",
  minWidth = "720px",
  sideScroll = true,
  getRowKey,
  onAction,
}: Props<T>) => {
  // Constants
  const columns = getTableColumns(data)

  const sideScrollStyles = sideScroll ? "overflow-x-auto" : "overflow-x-hidden"

  return (
    <div className={`${sideScrollStyles}  ${className}`}>
      <table className="w-full border-collapse" style={{ minWidth }}>
        <TableHeader columns={columns} />

        <TableBody
          columns={columns}
          data={data}
          emptyMessage={emptyMessage}
          getRowKey={getRowKey}
          onAction={onAction}
        />
      </table>
    </div>
  )
}

export type { TableCellData, TableCellType, TableRowData } from "./types"
