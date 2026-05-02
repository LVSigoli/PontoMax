import { AuthenticatedUser } from "@/contexts/AuthContext/types"
import { ADMIN_ITEMS, ADMIN_ROLES, SIDEBAR_ITEMS } from "./constants"

export function buildNavigationItem(user: AuthenticatedUser | null) {
  if (!user) return []

  if (!user.role || !ADMIN_ROLES.includes(user.role)) return [...SIDEBAR_ITEMS]

  return [...SIDEBAR_ITEMS, ...ADMIN_ITEMS]
}
