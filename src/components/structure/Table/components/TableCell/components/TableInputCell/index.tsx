import type { TableCellRenderData } from "../../../../types"
import { getCellInputType, getCellStringValue } from "../../utils"

interface Props {
  cell: TableCellRenderData
  onChange?: (value: string) => void
}

export const TableInputCell: React.FC<Props> = ({ cell, onChange }) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event.target.value)
  }

  return (
    <input
      type={getCellInputType(cell.type)}
      value={getCellStringValue(cell.value)}
      placeholder={cell.placeholder}
      disabled={cell.disabled}
      className={`h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-content-muted outline-none transition placeholder:text-content-muted focus:border-border-focus focus:bg-surface-page disabled:cursor-not-allowed disabled:opacity-60 ${cell.className ?? ""}`}
      onClick={(event) => event.stopPropagation()}
      onChange={handleChange}
    />
  )
}
