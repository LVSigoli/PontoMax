// Components
import { Select } from "@/components/structure/Select"

// Utils
import { getCellStringValue } from "../../utils"

// Types
import type { TableCellRenderData } from "../../../../types"

interface Props {
  cell: TableCellRenderData
  onChange?: (value: string) => void
}

export const TableSelectCell: React.FC<Props> = ({ cell, onChange }) => {
  // Constants
  const options = cell.options ?? []
  const value = getCellStringValue(cell.value)
  const selectedItem = options.filter((option) => option.value === value)

  // Functions
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
