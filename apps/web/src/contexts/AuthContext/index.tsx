// External Libraries
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

// Services
import {
  clearAuthSession,
  getAuthSession,
  postLogin,
  saveAuthSession,
} from "@/services/auth"

// Types
import { AuthSession, LoginPayload } from "@/types"
import type { AuthContextValues, AuthenticatedUser } from "./types"

const AuthContext = createContext<AuthContextValues | null>(null)

interface Props {
  children: React.ReactNode
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSession(getAuthSession())
    setIsLoading(false)
  }, [])

  async function login(payload: LoginPayload) {
    const nextSession = await postLogin(payload)

    saveAuthSession(nextSession)
    setSession(nextSession)

    return nextSession
  }

  function logout() {
    clearAuthSession()
    setSession(null)
  }

  const user = useMemo<AuthenticatedUser | null>(() => {
    if (!session) return null

    return {
      ...session.user,
      groups: new Set(session.user.groups),
    }
  }, [session])

  const value = useMemo<AuthContextValues>(
    () => ({
      isLoading,
      isValidating: isLoading,
      isAuthenticated: Boolean(user),
      session,
      user,
      login,
      logout,
    }),
    [isLoading, session, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
