import type { NavigationItem } from "../../types"
import { SidebarItem } from "../SidebarItem"

interface Props {
  items: NavigationItem[]
  className?: string
  onItemClick?: () => void
  isItemActive: (item: NavigationItem) => boolean
}

export const SidebarNavigation: React.FC<Props> = ({
  items,
  className = "",
  onItemClick,
  isItemActive,
}) => {
  return (
    <nav className={className}>
      {items.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          isActive={isItemActive(item)}
          onClick={onItemClick}
        />
      ))}
    </nav>
  )
}
