import type { StaticImageData } from "next/image"
import type { Key, ReactNode } from "react"

export type TableCellType = "text" | "badge" | "action"

export interface TableCellData {
  valor: ReactNode
  tipo?: TableCellType
  color?: string
  allowAction?: boolean
}

export type TableRowData = Record<string, TableCellData>

export interface TableAction {
  id: string
  label: string
  icon: ReactNode | string | StaticImageData
  color?: string
}

export interface Props<T extends TableRowData> {
  data: T[]
  actions?: TableAction[]
  allowActions?: boolean
  emptyMessage?: string
  minWidth?: string
  className?: string
  sideScroll?: boolean
  getRowKey?: (row: T, index: number) => Key
  onRowSelect?: (row: T) => void
  onActionClick?: (actionId: TableAction["id"], row: T) => void
}

export interface TableCellProps<T extends TableRowData> {
  cell: TableCellData
  cellKey: keyof T
  row: T
  onAction?: (row: T, key: keyof T) => void
}

export interface TableActionsProps<T extends TableRowData> {
  actions: TableAction[]
  row: T
  handleActionClick?: (actionId: TableAction["id"], row: T) => void
}
