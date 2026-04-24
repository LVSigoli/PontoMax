import type { SelecttionOption } from "../../../../types"

export interface Props {
  option: SelecttionOption
  selected: boolean
  onClick: (option: SelecttionOption) => void
}
