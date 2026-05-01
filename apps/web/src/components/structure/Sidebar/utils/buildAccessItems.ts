import { AuthenticatedUser } from "@/contexts/AuthContext/types"
import { ADMIN_ITEMS, ADMIN_ROLES, SIDEBAR_ITEMS } from "./constants"

export function buildNavigationItem(user: AuthenticatedUser | null) {
  if (!user) return []

  let accesItems = SIDEBAR_ITEMS

  if (!user.role || !ADMIN_ROLES.includes(user.role)) return accesItems

  ADMIN_ITEMS.forEach((item) => accesItems.push(item))

  return accesItems
}
