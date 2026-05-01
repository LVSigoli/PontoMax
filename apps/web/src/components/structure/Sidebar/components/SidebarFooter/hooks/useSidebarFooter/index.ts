// External Libraries
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"

// Hooks
import { useAuth } from "@/contexts/AuthContext"

// Utils
import { getUserSubtitle } from "./utils/getUserSubtitle"

export function useSidebarFooter() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { user, logout } = useAuth()

  // States
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Constants
  const userName = user?.name ?? "Usuário"
  const userParams = { position: user?.position, role: user?.role }
  const userSubtitle = getUserSubtitle(userParams)

  // Effects
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

  // Fuctions

  async function handleLogoutClick() {
    setIsMenuOpen(false)

    logout()

    await router.push("/login")
  }

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev)
  }

  return {
    isMenuOpen,
    userName,
    userSubtitle,
    containerRef,
    toggleMenu,
    handleLogoutClick,
  }
}
