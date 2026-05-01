import type { Key, ReactElement, ReactNode } from "react"

import type { IconName } from "../Icon"
import type { SelectionOption } from "../Select/types"

export type TableCellType =
  | "text"
  | "badge"
  | "action"
  | "input"
  | "data-picker"
  | "select"
  | "date-picker"
  | "time-picker"
  | "date-time-picker"

interface TableCellBase {
  value?: ReactNode
  valor?: ReactNode
  type?: TableCellType
  tipo?: TableCellType
  color?: string
  className?: string
  allowAction?: boolean
  disabled?: boolean
}

interface TableEditableCellBase extends TableCellBase {
  value: string
  placeholder?: string
}

interface TableTextCellData extends TableCellBase {
  type?: "text" | "badge" | "action"
}

interface TableInputCellData extends TableEditableCellBase {
  type:
    | "input"
    | "data-picker"
    | "date-picker"
    | "time-picker"
    | "date-time-picker"
}

interface TableSelectCellData extends TableEditableCellBase {
  type: "select"
  options: SelectionOption[]
  multi?: boolean
}

export type TableCellData =
  | TableTextCellData
  | TableInputCellData
  | TableSelectCellData

export interface TableCellRenderData extends TableCellBase {
  value: ReactNode
  type: TableCellType
  placeholder?: string
  options?: SelectionOption[]
  multi?: boolean
}

export type TableRowData = Record<string, TableCellData>

export interface TableAction {
  id: string
  label: string
  icon: IconName | ReactElement
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
  onCellChange?: (row: T, cellKey: keyof T, value: string) => void
}

export interface TableCellProps<T extends TableRowData> {
  cell: TableCellData
  cellKey: keyof T
  row: T
  onAction?: (row: T, key: keyof T) => void
  onChange?: (row: T, key: keyof T, value: string) => void
}

export interface TableActionsProps<T extends TableRowData> {
  actions: TableAction[]
  row: T
  handleActionClick?: (actionId: TableAction["id"], row: T) => void
}
