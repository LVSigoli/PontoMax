import { Input } from "@/components/structure/Input"
import { Picker } from "@/components/structure/Picker"

import type { TableCellRenderData } from "../../../../types"
import { getCellStringValue, getTablePickerType } from "../../utils"

interface Props {
  cell: TableCellRenderData
  onChange?: (value: string) => void
}

export const TableInputCell: React.FC<Props> = ({ cell, onChange }) => {
  if (cell.type === "input") {
    return (
      <Input
        value={getCellStringValue(cell.value)}
        placeholder={cell.placeholder}
        disabled={cell.disabled}
        variant="table"
        fieldClassName={cell.className}
        onChange={(value) => onChange?.(value)}
      />
    )
  }

  return (
    <Picker
      type={getTablePickerType(cell.type)}
      value={getCellStringValue(cell.value)}
      placeholder={cell.placeholder}
      disabled={cell.disabled}
      variant="table"
      fieldClassName={cell.className}
      onChange={(value) => onChange?.(value)}
    />
  )
}
