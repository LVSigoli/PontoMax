import type { UserGroup } from "@/services/auth"
import { AuthSession, LoginPayload } from "@/types"

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
  groups: Set<UserGroup>
}

export interface AuthContextValues {
  isLoading: boolean
  isValidating: boolean
  isAuthenticated: boolean
  session: AuthSession | null
  user: AuthenticatedUser | null
  login: (payload: LoginPayload) => Promise<AuthSession>
  logout: () => void
}
