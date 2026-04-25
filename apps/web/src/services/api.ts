import axios from "axios"

import { clearAuthSession, getAccessToken } from "./auth"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3333"

export const PONTO_MAX_API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

PONTO_MAX_API.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

PONTO_MAX_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthSession()
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)
