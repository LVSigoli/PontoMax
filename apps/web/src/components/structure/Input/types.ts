import type { MaskName } from "@/services/maskModule"

type IconPlacement = "start" | "end"

export interface Props {
  title: string
  value: string
  icon?: string
  type?: string
  mask?: MaskName
  placeholder: string
  disabled?: boolean
  iconPlacement?: IconPlacement
  onChange: (v: string) => void
  onIconClick?: () => void
}
