// External Libraries
import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useSWRConfig } from "swr"

// Services
import {
  clearAuthSession,
  getAuthSession,
  getRefreshToken,
  postLogin,
  postLogout,
  saveAuthSession,
} from "@/services/auth"
import { swrKeys, useCurrentUserSWR } from "@/hooks/swr"

// Types
import { AuthSession, LoginPayload } from "@/types"
import type { AuthContextValues, AuthenticatedUser } from "./types"

const AuthContext = createContext<AuthContextValues | null>(null)

interface Props {
  children: React.ReactNode
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  // States
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hasHydratedSession, setHasHydratedSession] = useState(false)

  // Hooks
  const { mutate: mutateSWRCache } = useSWRConfig()

  const shouldLoadCurrentUser = hasHydratedSession && Boolean(session)

  const { data, isLoading, isValidating } = useCurrentUserSWR({
    enabled: shouldLoadCurrentUser,
    onError: () => {
      clearAuthSession()
      setSession(null)
    },
    onSuccess: (response) => {
      setSession((currentSession) => {
        if (!currentSession) return currentSession

        const nextSession = {
          ...currentSession,
          user: response.user,
        }

        saveAuthSession(nextSession)

        return nextSession
      })
    },
  })

  // Constants
  const isSessionLoading =
    !hasHydratedSession || (shouldLoadCurrentUser && isLoading)
  const user = useMemo<AuthenticatedUser | null>(() => {
    const currentUser = data?.user ?? session?.user

    if (!currentUser) return null

    return {
      ...currentUser,
      groups: new Set(currentUser.groups),
    }
  }, [data?.user, session?.user])

  // Effects
  useEffect(() => {
    const currentSession = getAuthSession()

    setSession(currentSession)
    setHasHydratedSession(true)
  }, [])

  async function login(payload: LoginPayload) {
    const nextSession = await postLogin(payload)

    if (!nextSession.requiresPasswordChange) {
      saveAuthSession(nextSession)
      setSession(nextSession)
      setHasHydratedSession(true)
      await mutateSWRCache(
        swrKeys.auth.currentUser(),
        { user: nextSession.user },
        {
          revalidate: false,
        }
      )
    }

    return nextSession
  }

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken()

      if (refreshToken) await postLogout(refreshToken)
    } catch (e) {
      console.log(e)
    } finally {
      clearAuthSession()
      setSession(null)
      await mutateSWRCache(swrKeys.auth.currentUser(), undefined, {
        populateCache: false,
        revalidate: false,
      })
    }
  }, [mutateSWRCache])

  const value = useMemo<AuthContextValues>(
    () => ({
      isLoading: isSessionLoading,
      isValidating,
      isAuthenticated: Boolean(user),
      session,
      user,
      login,
      logout,
    }),
    [isSessionLoading, isValidating, session, user, logout]
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
