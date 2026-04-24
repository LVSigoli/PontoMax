// External Libraries
import { createContext, useContext, useState } from "react"

// Constants
import {
  INITIAL_COMPANIES,
  INITIAL_EMPLOYEES,
  INITIAL_JOURNEYS,
} from "../../constants"

// Types
import type {
  Company,
  CompanyForm,
  Employee,
  EmployeeForm,
  Journey,
  JourneyForm,
  ManagementEntity,
  ManagementTabId,
} from "../../types"
import type { ManagementContextValue, ManagementProviderProps } from "./types"

const ManagementContext = createContext<ManagementContextValue | null>(null)

export const ManagementProvider: React.FC<ManagementProviderProps> = ({
  children,
}) => {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [journeys, setJourneys] = useState<Journey[]>(INITIAL_JOURNEYS)

  function removeEntity(view: ManagementTabId, id: number) {
    if (view === "companies") {
      setCompanies((currentCompanies) =>
        currentCompanies.filter((company) => company.id !== id)
      )
      return
    }

    if (view === "employees") {
      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee.id !== id)
      )
      return
    }

    setJourneys((currentJourneys) =>
      currentJourneys.filter((journey) => journey.id !== id)
    )
  }

  function saveEntity(
    view: ManagementTabId,
    entity: ManagementEntity | null,
    form: unknown
  ) {
    if (view === "companies") {
      saveCompany(entity as Company | null, form as CompanyForm)
      return
    }

    if (view === "employees") {
      saveEmployee(entity as Employee | null, form as EmployeeForm)
      return
    }

    saveJourney(entity as Journey | null, form as JourneyForm)
  }

  function saveCompany(entity: Company | null, form: CompanyForm) {
    if (entity) {
      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === entity.id ? { ...company, ...form } : company
        )
      )
      return
    }

    setCompanies((currentCompanies) => [
      ...currentCompanies,
      {
        id: Date.now(),
        employees: 0,
        ...form,
      },
    ])
  }

  function saveEmployee(entity: Employee | null, form: EmployeeForm) {
    if (entity) {
      setEmployees((currentEmployees) =>
        currentEmployees.map((employee) =>
          employee.id === entity.id ? { ...employee, ...form } : employee
        )
      )
      return
    }

    setEmployees((currentEmployees) => [
      ...currentEmployees,
      {
        id: Date.now(),
        ...form,
      },
    ])
  }

  function saveJourney(entity: Journey | null, form: JourneyForm) {
    if (entity) {
      setJourneys((currentJourneys) =>
        currentJourneys.map((journey) =>
          journey.id === entity.id ? { ...journey, ...form } : journey
        )
      )
      return
    }

    setJourneys((currentJourneys) => [
      ...currentJourneys,
      {
        id: Date.now(),
        employees: 0,
        ...form,
      },
    ])
  }

  const value: ManagementContextValue = {
    companies,
    employees,
    journeys,
    removeEntity,
    saveEntity,
  }

  return (
    <ManagementContext.Provider value={value}>
      {children}
    </ManagementContext.Provider>
  )
}

export function useManagementContext() {
  const context = useContext(ManagementContext)

  if (!context) {
    throw new Error(
      "useManagementContext must be used inside ManagementProvider"
    )
  }

  return context
}
