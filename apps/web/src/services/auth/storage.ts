import { AuthSession } from "@/types"

export const AUTH_STORAGE_KEY = "pontomax.auth.session"

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession() {
  if (typeof window === "undefined") return null

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) return null

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null
}

export function getRefreshToken() {
  return getAuthSession()?.refreshToken ?? null
}

export function clearAuthSession() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
