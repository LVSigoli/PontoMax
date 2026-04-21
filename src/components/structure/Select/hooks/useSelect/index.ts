import { UseSelectParams } from "./types"

export function useSelect({
  selectedItem,
  options,
  multi,
  onSelectionChange,
}: UseSelectParams) {
  // Functions
  function handleSelectionChange(id: string) {
    if (!id) return []

    const currentSelection = options.find((option) => option.value === id)

    if (!currentSelection) return

    if (multi) {
      const isSelected = selectedItem.some((item) => item.value === id)
      const updatedSelection = isSelected
        ? selectedItem.filter((item) => item.value !== id)
        : [...selectedItem, currentSelection]

      onSelectionChange(updatedSelection)
      return updatedSelection
    }

    onSelectionChange([currentSelection])
    return [currentSelection]
  }

  return {
    selected: selectedItem,
    handleSelectionChange,
  }
}
