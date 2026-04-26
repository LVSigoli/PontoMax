export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  groups: string[]
  companyId?: number
  companyName?: string | null
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}
