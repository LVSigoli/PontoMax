// External Libraries
import { useRouter } from "next/router"

// Types
import { LoginView } from "./types"

export function useLoginPage() {
  // Hooks
  const router = useRouter()

  const view = router.isReady ? getLoginView(router.query.view) : "login"

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

  return {
    view,
    handleLoginClick,
    handleForgotPasswordClick,
    handleReplacePasswordClick,
  }
}

function getLoginView(view: string | string[] | undefined): LoginView {
  if (view === "forgot-password" || view === "replace-password") return view

  return "login"
}
