import type { TableRowData } from "./types"

export const getTableColumns = <T extends TableRowData>(data: T[]) => {
  return data.reduce<Array<keyof T>>((columns, row) => {
    const rowKeys = Object.keys(row) as Array<keyof T>

    rowKeys.forEach((key) => {
      if (!columns.includes(key)) columns.push(key)
    })

    return columns
  }, [])
}

export const getColumnTitle = (key: string | number | symbol) => {
  return String(key)
}
