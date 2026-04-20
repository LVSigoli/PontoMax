// Components
import { TableBody } from "./components/TableBody"
import { TableHeader } from "./components/TableHeader"

// Types
import type { Props, TableRowData } from "./types"

// Utils
import { getTableColumns } from "./utils"

export const Table = <T extends TableRowData>({
  actions,
  allowActions = false,
  data,
  emptyMessage,
  className = "",
  minWidth = "720px",
  sideScroll = true,
  getRowKey,
  onActionClick,
  onRowSelect,
}: Props<T>) => {
  // Constants
  const columns = getTableColumns(data)

  const sideScrollStyles = sideScroll ? "overflow-x-auto" : "overflow-x-hidden"

  return (
    <div className={`${sideScrollStyles}  ${className}`}>
      <table className="w-full border-collapse" style={{ minWidth }}>
        <TableHeader allowActions={allowActions} columns={columns} />

        <TableBody
          data={data}
          actions={actions}
          columns={columns}
          allowActions={allowActions}
          emptyMessage={emptyMessage}
          getRowKey={getRowKey}
          onRowSelect={onRowSelect}
          onActionClick={onActionClick}
        />
      </table>
    </div>
  )
}
