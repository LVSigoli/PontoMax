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
  getCurrentUser,
  getAuthSession,
  getRefreshToken,
  postLogin,
  postLogout,
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
    void hydrateSession()
  }, [])

  async function hydrateSession() {
    const currentSession = getAuthSession()

    if (!currentSession) {
      setSession(null)
      setIsLoading(false)
      return
    }

    try {
      const user = await getCurrentUser()
      setSession({
        ...currentSession,
        user,
      })
      saveAuthSession({
        ...currentSession,
        user,
      })
    } catch {
      clearAuthSession()
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(payload: LoginPayload) {
    const nextSession = await postLogin(payload)

    if (!nextSession.requiresPasswordChange) {
      saveAuthSession(nextSession)
      setSession(nextSession)
    }

    return nextSession
  }

  function logout() {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      void postLogout(refreshToken).catch(() => undefined)
    }

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
