import type { IconName } from "../Icon"

export interface NavigationItem {
  label: string
  id: string
  icon: IconName
  href?: string
}
