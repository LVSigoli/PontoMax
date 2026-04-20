import { Props } from "./types"

export const SidebarItem: React.FC<Props> = ({ isActive, item }) => {
  // Constants
  const itemStyle = isActive
    ? "bg-brand-50 text-brand-700"
    : "text-content-secondary hover:bg-surface-muted"

  return (
    <button
      className={`flex h-10 items-center cursor-pointer rounded-md px-3 text-left text-sm font-medium transition ${itemStyle}`}
      type="button"
    >
      {item.label}
    </button>
  )
}
