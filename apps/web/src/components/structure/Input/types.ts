import type { MaskName } from "@/services/maskModule"
import type { IconName } from "../Icon"

type IconPlacement = "start" | "end"

export interface Props {
  title: string
  value: string
  icon?: IconName
  type?: string
  mask?: MaskName
  placeholder: string
  disabled?: boolean
  iconPlacement?: IconPlacement
  onChange: (v: string) => void
  onIconClick?: () => void
}
