import type { MaskName } from "@/services/maskModule"
import type { IconName } from "../Icon"

type IconPlacement = "start" | "end"
type InputVariant = "default" | "table"

export interface Props {
  title?: string
  value: string
  icon?: IconName
  type?: string
  mask?: MaskName
  placeholder?: string
  disabled?: boolean
  variant?: InputVariant
  iconPlacement?: IconPlacement
  className?: string
  fieldClassName?: string
  onChange: (v: string) => void
  onIconClick?: () => void
}
