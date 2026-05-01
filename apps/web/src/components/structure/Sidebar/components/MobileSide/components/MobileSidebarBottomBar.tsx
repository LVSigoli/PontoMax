import Link from "next/link"

import { Icon } from "@/components/structure/Icon"
import type { MobileSidebarBottomBarProps } from "../types"

export const MobileSidebarBottomBar: React.FC<MobileSidebarBottomBarProps> = ({
  isOpen,
  items,
  onOpen,
  isItemActive,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-card/95 backdrop-blur lg:hidden">
      <nav className="flex flex-row  gap-1 justify-evenly px-2 py-2">
        {items.map((item) => {
          const itemClassName = isItemActive(item)
            ? "bg-brand-50 text-brand-700"
            : "text-content-secondary"

          return (
            <Link
              key={item.id}
              href={item.href ?? "#"}
              className={`flex min-h-12 items-center justify-evenly rounded-xl px-2 text-center text-xs font-semibold transition ${itemClassName}`}
            >
              <div className="w-full flex-col items-center  place-items-center">
                <Icon name={item.icon} layout="inline" />

                {item.label}
              </div>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={onOpen}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-panel"
          className="flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold text-content-secondary transition hover:bg-surface-muted"
        >
          Mais
        </button>
      </nav>
    </div>
  )
}
