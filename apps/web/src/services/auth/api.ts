import { PONTO_MAX_API } from "../api"
import type { AuthSession, LoginPayload, LoginResponse } from "@/types"
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  MeResponse,
  ResetPasswordPayload,
} from "./types"

export async function postLogin(payload: LoginPayload) {
  const response = await PONTO_MAX_API.post<LoginResponse>("auth/login", payload)
  return response.data
}

export async function postLogout(refreshToken: string) {
  await PONTO_MAX_API.post("auth/logout", { refreshToken })
}

export async function postRefresh(refreshToken: string) {
  const response = await PONTO_MAX_API.post<AuthSession>("auth/refresh", {
    refreshToken,
  })
  return response.data
}

export async function getCurrentUser() {
  const response = await PONTO_MAX_API.get<MeResponse>("auth/me")
  return response.data.user
}

export async function postForgotPassword(payload: ForgotPasswordPayload) {
  const response = await PONTO_MAX_API.post<ForgotPasswordResponse>(
    "auth/forgot-password",
    payload
  )

  return response.data
}

export async function postResetPassword(payload: ResetPasswordPayload) {
  await PONTO_MAX_API.post("auth/reset-password", payload)
}
