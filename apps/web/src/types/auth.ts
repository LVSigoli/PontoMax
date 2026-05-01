export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  groups: string[]
  companyId?: number
  companyName?: string | null
  mustChangePassword: boolean
}

export interface AuthSession {
  requiresPasswordChange: false
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface PasswordChangeRequiredLogin {
  requiresPasswordChange: true
  resetToken: string
  message: string
  email: string
}

export type LoginResponse = AuthSession | PasswordChangeRequiredLogin

export interface LoginPayload {
  email: string
  password: string
}
