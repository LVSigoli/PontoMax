import type { IconName } from "../Icon"

export interface Props {
  search: (value: string) => void
  value: string
  placeHolder?: string
  startIcon?: IconName
  className?: string
  disabled?: boolean
}
