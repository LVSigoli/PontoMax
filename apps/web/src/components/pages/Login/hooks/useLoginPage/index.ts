// External Libraries
import { useRouter } from "next/router"
import { useEffect } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Types
import { LoginView } from "./types"

export function useLoginPage() {
  // Hooks
  const router = useRouter()
  const { user, isValidating } = useAuth()

  // Constants
  const view = router.isReady ? getLoginView(router.query.view) : "login"

  // Effects
  useEffect(() => {
    if (!router.isReady || !user || isValidating) return

    void router.replace("/")
  }, [isValidating, router, user])

  // Funtions
  function handleForgotPasswordClick() {
    handleLoginViewChange("forgot-password")
  }

  function handleReplacePasswordClick() {
    handleLoginViewChange("replace-password")
  }

  function handleLoginClick() {
    handleLoginViewChange("login")
  }

  function handleLoginViewChange(nextView: LoginView) {
    if (!router.isReady) return

    const query = { ...router.query }

    if (nextView === "login") {
      delete query.view
    } else {
      query.view = nextView
    }

    void router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    })
  }

  function getLoginView(view: string | string[] | undefined): LoginView {
    if (view === "forgot-password" || view === "replace-password") return view

    return "login"
  }

  return {
    view,
    handleLoginClick,
    handleForgotPasswordClick,
    handleReplacePasswordClick,
  }
}
