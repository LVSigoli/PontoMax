/* eslint-disable react-hooks/rules-of-hooks */
import type { JSX } from "react"

import { Login } from "@/components/pages/Login"
import { Head } from "@/components/structure/Head"
import { useAuth } from "@/contexts/AuthContext"

export function withAuthentication(
  Component: JSX.Element,
  allowedGroups?: string[]
): JSX.Element {
  const { user, isValidating } = useAuth()

  if (isValidating) return <Head title="PontoMax | Tudo em um so lugar" />

  if (!user) return <Login />

  if (!canAccessPage(user.role, allowedGroups))
    return <Head title="Sem acesso" />

  return Component
}

function canAccessPage(role: string, allowedGroups?: string[]) {
  if (!allowedGroups?.length) return true

  return allowedGroups?.includes(role)
}
