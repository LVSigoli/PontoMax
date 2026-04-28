// External Libraries
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState } from "react"

// Components
import { SidebarFooter } from "./components/SidebarFooter"
import { SidebarHeader } from "./components/SidebarHeader"
import { SidebarItem } from "./components/SidebarItem"

// Utils
import { SIDEBAR_ITEMS } from "./constants"

export const Sidebar: React.FC = () => {
  // Hooks
  const { pathname } = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const primaryMobileItems = useMemo(() => SIDEBAR_ITEMS.slice(0, 4), [])

  // Functions
  function isItemActive(itemId: string, href?: string) {
    return href ? pathname === href : pathname.includes(itemId)
  }

  function renderSidebarItem(onItemClick?: () => void) {
    return SIDEBAR_ITEMS.map((item) => (
      <SidebarItem
        key={item.id}
        isActive={isItemActive(item.id, item.href)}
        item={item}
        onClick={onItemClick}
      />
    ))
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-card/95 backdrop-blur lg:hidden">
        <nav className="grid grid-cols-5 gap-1 px-2 py-2">
          {primaryMobileItems.map((item) => {
            const isActive = isItemActive(item.id, item.href)
            const itemClassName = isActive
              ? "bg-brand-50 text-brand-700"
              : "text-content-secondary"

            return (
              <Link
                key={item.id}
                href={item.href ?? "#"}
                className={`flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold transition ${itemClassName}`}
              >
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            className="flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold text-content-secondary transition hover:bg-surface-muted"
          >
            Mais
          </button>
        </nav>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu de navegacao"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside
            id="mobile-navigation-panel"
            className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col border-l border-border-subtle bg-surface-card shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
              <SidebarHeader className="px-0 py-0" showBorder={false} />

              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-content-secondary transition hover:bg-surface-muted"
              >
                Fechar
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
              {renderSidebarItem(() => setIsMobileMenuOpen(false))}
            </nav>

            <SidebarFooter />
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-dvh w-56 shrink-0 border-r border-border-subtle bg-surface-card lg:flex lg:flex-col">
        <SidebarHeader />

        <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
          {renderSidebarItem()}
        </nav>

        <SidebarFooter />
      </aside>
    </>
  )
}
