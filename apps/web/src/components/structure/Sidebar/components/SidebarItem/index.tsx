import Link from "next/link"

import { Icon } from "@/components/structure/Icon"
import { Props } from "./types"

export const SidebarItem: React.FC<Props> = ({
  isActive,
  item,
  onClick,
}) => {
  // Constants
  const itemStyle = isActive
    ? "bg-brand-50 text-brand-700"
    : "text-content-secondary hover:bg-surface-muted"

  const className = `flex h-10 items-center cursor-pointer rounded-md px-3 text-left text-sm font-medium transition ${itemStyle}`

  if (!item.href) {
    return (
      <button className={className} type="button" onClick={onClick}>
        {item.label}
      </button>
    )
  }

  return (
    <Link className={className} href={item.href} onClick={onClick}>
      <div className="w-full flex flex-row items-center gap-1.5">
        <Icon
          name={item.icon}
          size="1rem"
          layout="inline"
          className="text-current"
        />

        {item.label}
      </div>
    </Link>
  )
}
