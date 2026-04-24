import type { RefObject } from "react"

import type { OptionsPosition, SelecttionOption } from "../../types"

export interface Props {
  multi?: boolean
  options: SelecttionOption[]
  selectedItems: SelecttionOption[]
  optionsPosition: OptionsPosition
  optionsRef: RefObject<HTMLDivElement | null>
  onOptionClick: (option: SelecttionOption) => void
}
