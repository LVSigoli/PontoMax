import type { TextSwitchOption } from "@/components/structure/TextSwitch"

export type ManagementTabId = "companies" | "employees" | "journeys"
export type ManagementMode = "create" | "edit"

export interface ManagementTabOption extends TextSwitchOption {
  id: ManagementTabId
}

export interface Company {
  id: number
  clientId?: number
  legalName?: string
  tradeName?: string | null
  name: string
  cnpj: string
  timezone?: string
  isActive?: boolean
  employees: number
}

export interface Employee {
  id: number
  userRole?: string
  name: string
  cpf: string
  email: string
  role: string
  companyId: number
  journeyId: number
  managerAccess: boolean
}

export interface Journey {
  id: number
  companyId?: number
  name: string
  description?: string | null
  flexible: boolean
  startTime: string
  endTime: string
  interval: string
  scale: string
  dailyWorkMinutes?: number
  weeklyWorkMinutes?: number | null
  toleranceMinutes?: number
  nightShift?: boolean
  isActive?: boolean
  employees: number
}

export type ManagementEntity = Company | Employee | Journey

export type CompanyForm = Omit<Company, "employees" | "id">
export type EmployeeForm = Omit<Employee, "id">
export type JourneyForm = Omit<Journey, "employees" | "id">
export type ManagementForm = CompanyForm | EmployeeForm | JourneyForm
