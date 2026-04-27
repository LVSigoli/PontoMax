//  External Libraries
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"

// Components
import { Typography } from "@/components/structure/Typography"
import { useAuth } from "@/contexts/AuthContext"
import { ContextMenu } from "./components/ContextMenu"

export const SidebarFooter: React.FC = () => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  async function handleLogoutClick() {
    setIsMenuOpen(false)
    logout()
    await router.push("/login")
  }

  return (
    <div
      ref={containerRef}
      className="relative border-t border-border-subtle px-4 py-4"
    >
      <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-1">
        <div className="min-w-0">
          <Typography
            variant="b3"
            fontWeight={700}
            value={user?.name ?? "Usuário"}
            className="truncate"
          />
          <Typography
            variant="legal"
            value={user?.email ?? ""}
            className="truncate text-content-muted"
          />
        </div>

        <button
          type="button"
          aria-label="Abrir menu do usuário"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          className="flex p-1  items-center justify-center rounded-md text-lg font-semibold text-content-muted hover:text-content-primary cursor-pointer"
        >
          ...
        </button>
      </div>

      {isMenuOpen ? <ContextMenu onLogout={handleLogoutClick} /> : null}
    </div>
  )
}
