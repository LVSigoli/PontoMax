// External Libraries
import { createContext, useContext, useEffect, useState } from "react"

// Services
import type { UserInviteApiItem } from "@/services/domain"
import {
  createCompany,
  createJourney,
  createUser,
  deleteCompany,
  deleteJourney,
  deleteUser,
  getCompanies,
  getJourneys,
  getUsers,
  updateCompany,
  updateJourney,
  updateUser,
} from "@/services/domain"

// Utils
import {
  buildCompanyPayload,
  buildEmployeePayload,
  buildJourneyPayload,
  mapCompanyApiToCompany,
  mapJourneyApiToJourney,
  mapUserApiToEmployee,
} from "../../utils"
import { makeInitialInvite } from "./utils"

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
  // States
  const [isLoading, setIsLoading] = useState(true)
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [invite, setInvite] = useState<UserInviteApiItem>(makeInitialInvite)

  // Effects
  useEffect(() => {
    void loadManagementData()
  }, [])

  // Functions
  async function loadManagementData() {
    try {
      setIsLoading(true)

      const companyItems = await getCompanies()

      const [employeeItems, journeyItems] = await Promise.all([
        getUsers(),
        getJourneys(),
      ])

      setCompanies(companyItems.map(mapCompanyApiToCompany))
      setEmployees(employeeItems.map(mapUserApiToEmployee))
      setJourneys(journeyItems.map(mapJourneyApiToJourney))
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function removeEntity(view: ManagementTabId, id: number) {
    try {
      if (view === "companies") {
        await deleteCompany(id)
        setCompanies((currentCompanies) =>
          currentCompanies.filter((company) => company.id !== id)
        )
        return
      }

      if (view === "employees") {
        await deleteUser(id)
        setEmployees((currentEmployees) =>
          currentEmployees.filter((employee) => employee.id !== id)
        )
        return
      }

      await deleteJourney(id)
      setJourneys((currentJourneys) =>
        currentJourneys.filter((journey) => journey.id !== id)
      )
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async function saveEntity(
    view: ManagementTabId,
    entity: ManagementEntity | null,
    form: unknown
  ) {
    if (view === "companies") {
      await saveCompany(entity as Company | null, form as CompanyForm)
      return
    }

    if (view === "employees") {
      await saveEmployee(entity as Employee | null, form as EmployeeForm)
      return
    }

    await saveJourney(entity as Journey | null, form as JourneyForm)
  }

  async function saveCompany(entity: Company | null, form: CompanyForm) {
    try {
      const resolvedClientId =
        typeof form.clientId === "number" && form.clientId > 0
          ? form.clientId
          : (companies[0]?.clientId ?? 1)
      const payload = buildCompanyPayload({
        ...form,
        clientId: resolvedClientId,
      })

      if (entity) {
        const updatedCompany = await updateCompany(entity.id, payload)
        setCompanies((currentCompanies) =>
          currentCompanies.map((company) =>
            company.id === entity.id
              ? mapCompanyApiToCompany(updatedCompany)
              : company
          )
        )
        return
      }

      const createdCompany = await createCompany(payload)
      setCompanies((currentCompanies) => [
        ...currentCompanies,
        mapCompanyApiToCompany(createdCompany),
      ])
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async function saveEmployee(entity: Employee | null, form: EmployeeForm) {
    try {
      const payload = buildEmployeePayload(form)

      if (entity) {
        const updatedEmployee = await updateUser(entity.id, payload)
        setEmployees((currentEmployees) =>
          currentEmployees.map((employee) =>
            employee.id === entity.id
              ? mapUserApiToEmployee(updatedEmployee)
              : employee
          )
        )
        return
      }

      const createdEmployeeResponse = await createUser(payload)
      const createdEmployee = createdEmployeeResponse.item
      setEmployees((currentEmployees) => [
        ...currentEmployees,
        mapUserApiToEmployee(createdEmployee),
      ])

      setInvite(createdEmployeeResponse.invite)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async function saveJourney(entity: Journey | null, form: JourneyForm) {
    try {
      const resolvedCompanyId =
        typeof form.companyId === "number" && form.companyId > 0
          ? form.companyId
          : companies[0]?.id
      const payload = buildJourneyPayload({
        ...form,
        companyId: resolvedCompanyId,
      })

      if (entity) {
        const updatedJourney = await updateJourney(entity.id, payload)
        setJourneys((currentJourneys) =>
          currentJourneys.map((journey) =>
            journey.id === entity.id
              ? mapJourneyApiToJourney(updatedJourney)
              : journey
          )
        )
        return
      }

      const createdJourney = await createJourney(payload)
      setJourneys((currentJourneys) => [
        ...currentJourneys,
        mapJourneyApiToJourney(createdJourney),
      ])
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const value: ManagementContextValue = {
    isLoading,
    companies,
    employees,
    journeys,
    invite,
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
