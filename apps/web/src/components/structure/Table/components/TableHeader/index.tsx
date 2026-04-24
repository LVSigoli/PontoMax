// Utils
import { getColumnTitle } from "../../utils"

interface Props<T> {
  allowActions?: boolean
  columns: Array<keyof T>
}

export const TableHeader = <T,>({ allowActions = false, columns }: Props<T>) => {
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

        {allowActions ? (
          <th
            aria-label="Ações"
            className="w-12 px-3 py-3 text-right text-xs font-semibold text-content-muted"
          />
        ) : null}
      </tr>
    </thead>
  )
}
