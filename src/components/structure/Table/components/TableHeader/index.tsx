// Utils
import { getColumnTitle } from "../../utils"

interface Props<T> {
  columns: Array<keyof T>
}

export const TableHeader = <T,>({ columns }: Props<T>) => {
  return (
    <thead>
      <tr className="border-b border-border-subtle text-left">
        {columns.map((column) => (
          <th
            key={String(column)}
            className="px-3 py-3 text-xs font-semibold text-content-muted"
          >
            {getColumnTitle(column)}
          </th>
        ))}
      </tr>
    </thead>
  )
}
