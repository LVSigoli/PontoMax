import { Select } from "@/components/structure/Select"

import type { TableCellRenderData } from "../../../../types"
import { getCellStringValue } from "../../utils"

interface Props {
  cell: TableCellRenderData
  onChange?: (value: string) => void
}

export const TableSelectCell: React.FC<Props> = ({ cell, onChange }) => {
  const options = cell.options ?? []
  const value = getCellStringValue(cell.value)
  const selectedItem = options.filter((option) => option.value === value)

  function handleSelectionChange(selection: typeof options) {
    const selectedValue = selection[0]?.value

    if (selectedValue) onChange?.(selectedValue)
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Select
        multi={cell.multi}
        options={options}
        selectedItem={selectedItem}
        className={cell.className ?? "w-32"}
        buttonClassName="h-9 focus:bg-surface-page"
        valueClassName={cell.color}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  )
}
