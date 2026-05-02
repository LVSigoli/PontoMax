import type {
  CompanyForm,
  EmployeeForm,
  JourneyForm,
  ManagementEntity,
  ManagementForm,
  ManagementTabOption,
} from "../../types"

export type ManagementFormValue = string | number | boolean

export interface ManagementDrawerMethods {
  close: () => void
  open: () => void
  toggle: () => void
}

export interface Props {
  element: ManagementEntity | null
  view: ManagementTabOption
  onSuccess: () => void
}

export type CompanyFormData = CompanyForm
export type EmployeeFormData = EmployeeForm
export type JourneyFormData = JourneyForm
export type FormData = ManagementForm
