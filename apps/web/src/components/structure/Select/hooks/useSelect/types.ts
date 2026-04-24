import type { RefObject } from "react"

import type { OptionsPosition, Props, SelecttionOption } from "../../types"

export type UseSelectParams = Pick<
  Props,
  "label" | "multi" | "onSelectionChange" | "options" | "selectedItem"
>

export interface UseSelectReturn {
  buttonRef: RefObject<HTMLButtonElement | null>
  hasSelection: boolean
  isOpen: boolean
  optionsPosition: OptionsPosition
  optionsRef: RefObject<HTMLDivElement | null>
  selectRef: RefObject<HTMLDivElement | null>
  selected: SelecttionOption[]
  selectedLabel: string
  closeOptions: () => void
  handleSelectToggle: () => void
  getOptionProps: (option: SelecttionOption) => UseSelectOptionProps
}

export interface UseSelectOptionProps {
  selected: boolean
  onClick: () => void
}
