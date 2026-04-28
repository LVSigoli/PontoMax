import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  postRefresh,
  saveAuthSession,
} from "./auth"
import { getErrorMessage } from "./utils"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3333"

export const PONTO_MAX_API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

let refreshSessionPromise: Promise<string | null> | null = null

PONTO_MAX_API.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

PONTO_MAX_API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      const nextAccessToken = await refreshAccessToken()

      if (nextAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
        return PONTO_MAX_API(originalRequest)
      }
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthSession()
      window.location.href = "/login"
    }

    return Promise.reject(new Error(getErrorMessage(error, "Nao foi possivel concluir a requisicao.")))
  }
)

async function refreshAccessToken() {
  if (refreshSessionPromise) {
    return refreshSessionPromise
  }

  refreshSessionPromise = (async () => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      return null
    }

    try {
      const nextSession = await postRefresh(refreshToken)
      saveAuthSession(nextSession)
      return nextSession.accessToken
    } catch {
      clearAuthSession()
      return null
    } finally {
      refreshSessionPromise = null
    }
  })()

  return refreshSessionPromise
}
