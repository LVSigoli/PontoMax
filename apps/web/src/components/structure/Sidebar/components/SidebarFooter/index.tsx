//  External Libraries
import React from "react"

// Components
import { ContextMenu } from "./components/ContextMenu"
import { CustomerIdentification } from "./components/CustomerIdentification"
import { useSidebarFooter } from "./hooks/useSidebarFooter"

export const SidebarFooter: React.FC = () => {
  // Hooks
  const {
    userName,
    userSubtitle,
    isMenuOpen,
    containerRef,
    toggleMenu,
    handleLogoutClick,
  } = useSidebarFooter()
  return (
    <div
      ref={containerRef}
      className="relative border-t border-border-subtle px-4 py-4"
    >
      <div className="flex items-start justify-between gap-3 rounded-lg px-2 py-1">
        <CustomerIdentification name={userName} subtitle={userSubtitle} />

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menu do usuário"
          onClick={toggleMenu}
          className="flex shrink-0 p-1 items-center justify-center rounded-md text-lg font-semibold text-content-muted transition hover:text-content-primary cursor-pointer"
        >
          ...
        </button>
      </div>

      {isMenuOpen ? <ContextMenu onLogout={handleLogoutClick} /> : null}
    </div>
  )
}
