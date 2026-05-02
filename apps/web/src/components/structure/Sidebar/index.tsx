import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState } from "react"

// Components
import { MobileSidebar } from "./components/MobileSide"
import { SidebarFooter } from "./components/SidebarFooter"
import { SidebarHeader } from "./components/SidebarHeader"
import { SidebarNavigation } from "./components/SidebarNavigation"

// Utils
import { useAuth } from "@/contexts/AuthContext"
import type { NavigationItem } from "./types"
import { buildNavigationItem } from "./utils"

export const Sidebar: React.FC = () => {
  // Hooks
  const { user } = useAuth()
  const { pathname } = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Constants
  const sidebarItems = useMemo(() => buildNavigationItem(user), [user?.role])
  const primaryMobileItems = useMemo(
    () => sidebarItems.slice(0, 2),
    [sidebarItems]
  )

  // Functions
  function isItemActive(item: NavigationItem) {
    return item.href ? pathname === item.href : pathname.includes(item.id)
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        items={sidebarItems}
        primaryItems={primaryMobileItems}
        isItemActive={isItemActive}
        onOpen={() => setIsMobileMenuOpen(true)}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <aside className="hidden h-dvh w-56 shrink-0 border-r border-border-subtle bg-surface-card lg:flex lg:flex-col">
        <SidebarHeader />

        <SidebarNavigation
          items={sidebarItems}
          isItemActive={isItemActive}
          className="flex flex-1 flex-col gap-1 px-4 py-5"
        />

        <SidebarFooter />
      </aside>
    </>
  )
}
