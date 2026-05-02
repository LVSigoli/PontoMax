import type { RefObject } from "react"

import type { NavigationItem } from "../../types"

export interface MobileSidebarProps {
  isOpen: boolean
  items: NavigationItem[]
  primaryItems: NavigationItem[]
  onClose: () => void
  onOpen: () => void
  isItemActive: (item: NavigationItem) => boolean
}

export interface MobileSidebarBottomBarProps {
  isOpen: boolean
  items: NavigationItem[]
  onOpen: () => void
  isItemActive: (item: NavigationItem) => boolean
}

export interface MobileSidebarPanelProps {
  isOpen: boolean
  items: NavigationItem[]
  onClose: () => void
  isItemActive: (item: NavigationItem) => boolean
  panelRef: RefObject<HTMLElement | null>
}
