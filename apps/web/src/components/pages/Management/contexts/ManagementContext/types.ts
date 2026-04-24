import type { ReactNode } from "react"
import type {
  Company,
  Employee,
  Journey,
  ManagementEntity,
  ManagementTabId,
} from "../../types"

export interface ManagementContextValue {
  companies: Company[]
  employees: Employee[]
  journeys: Journey[]
  removeEntity: (view: ManagementTabId, id: number) => void
  saveEntity: (
    view: ManagementTabId,
    entity: ManagementEntity | null,
    form: unknown
  ) => void
}

export interface ManagementProviderProps {
  children: ReactNode
}
