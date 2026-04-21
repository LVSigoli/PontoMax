import type { StaticImageData } from "next/image"

export interface Props {
  label?: string
  multi?: boolean
  icon?: string | StaticImageData
  placement?: IconPlacement
  className?: string
  buttonClassName?: string
  valueClassName?: string
  options: SelecttionOption[]
  selectedItem: SelecttionOption[]
  onSelectionChange: (seletion: SelecttionOption[]) => void
}

export interface SelectionOption {
  value: string
  label: string
}

export interface OptionsPosition {
  left: number
  maxHeight: number
  top: number
  width: number
}

export type SelecttionOption = SelectionOption

type IconPlacement = "start" | "end"
