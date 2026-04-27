import type { UserGroup } from "@/services/auth"
import { AuthSession, LoginPayload, LoginResponse } from "@/types"

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
  groups: Set<UserGroup>
  mustChangePassword: boolean
}

export interface AuthContextValues {
  isLoading: boolean
  isValidating: boolean
  isAuthenticated: boolean
  session: AuthSession | null
  user: AuthenticatedUser | null
  login: (payload: LoginPayload) => Promise<LoginResponse>
  logout: () => void
}
