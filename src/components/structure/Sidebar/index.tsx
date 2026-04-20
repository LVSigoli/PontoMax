// External Libraries
import { useRouter } from "next/router"
import React from "react"

// Components
import { SidebarFooter } from "./components/SidebarFooter"
import { SidebarHeader } from "./components/SidebarHeader"
import { SidebarItem } from "./components/SidebarItem"

// Utils
import { SIDEBAR_ITEMS } from "./constants"

export const Sidebar: React.FC = () => {
  // Hooks
  const { pathname } = useRouter()

  // Functions
  function renderSidebarItem() {
    return SIDEBAR_ITEMS.map((item) => {
      const isActive = pathname.includes(item.id)

      return <SidebarItem key={item.id} isActive={isActive} item={item} />
    })
  }

  return (
    <aside className="hidden h-dvh w-56 shrink-0 border-r border-border-subtle bg-surface-card lg:flex lg:flex-col">
      <SidebarHeader />

      <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
        {renderSidebarItem()}
      </nav>

      <SidebarFooter />
    </aside>
  )
}
