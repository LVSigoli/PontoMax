import { UserInviteApiItem } from "@/services/domain"
import type { ReactNode } from "react"
import type {
  Company,
  Employee,
  Journey,
  ManagementEntity,
  ManagementTabId,
} from "../../types"

export interface ManagementContextValue {
  invite: UserInviteApiItem
  isLoading: boolean
  companies: Company[]
  employees: Employee[]
  journeys: Journey[]

  removeEntity: (view: ManagementTabId, id: number) => Promise<void>
  saveEntity: (
    view: ManagementTabId,
    entity: ManagementEntity | null,
    form: unknown
  ) => Promise<void>
}

export interface ManagementProviderProps {
  children: ReactNode
}
