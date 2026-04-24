import type { MaskName } from "@/services/maskModule"

type IconPlacement = "start" | "end" | "left" | "right"

export interface Props {
  title: string
  value: string
  icon?: string
  type?: string
  mask?: MaskName
  placeholder: string
  iconPlacement?: IconPlacement
  onChange: (v: string) => void
}
