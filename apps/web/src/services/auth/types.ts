import type { AuthSession } from "@/types"

export type UserGroup = string

export interface ForgotPasswordPayload {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  developmentResetUrl?: string
  previewPath?: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface MeResponse {
  user: AuthSession["user"]
}
