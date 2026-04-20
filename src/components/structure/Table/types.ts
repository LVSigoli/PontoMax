import type { Key, ReactNode } from "react"

export type TableCellType = "text" | "badge" | "action"

export interface TableCellData {
  valor: ReactNode
  tipo?: TableCellType
  color?: string
  allowAction?: boolean
}

export type TableRowData = Record<string, TableCellData>

export interface Props<T extends TableRowData> {
  data: T[]
  emptyMessage?: string
  minWidth?: string
  className?: string
  sideScroll?: boolean
  getRowKey?: (row: T, index: number) => Key
  onAction?: (row: T, key: keyof T) => void
}

export interface TableCellProps<T extends TableRowData> {
  cell: TableCellData
  cellKey: keyof T
  row: T
  onAction?: (row: T, key: keyof T) => void
}
