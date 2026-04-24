import type { ReactNode } from "react"

export interface TextSwitchOption {
  id: string
  label: string
  icon?: ReactNode
}

export interface Props<T extends TextSwitchOption = TextSwitchOption> {
  options: T[]
  value: T
  onChange: (option: T) => void
}
