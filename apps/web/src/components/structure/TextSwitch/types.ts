import { IconName } from "../Icon/generated"

export interface TextSwitchOption {
  id: string
  label: string
  icon?: IconName
}

export interface Props<T extends TextSwitchOption = TextSwitchOption> {
  options: T[]
  value: T
  onChange: (option: T) => void
}
