// External Libraries
import { createContext, useContext, useMemo, useState } from "react"
import { useSWRConfig } from "swr"

// Services
import type { UserInviteApiItem } from "@/services/domain"
import {
  createCompany,
  createJourney,
  createUser,
  deleteCompany,
  deleteJourney,
  deleteUser,
  updateCompany,
  updateJourney,
  updateUser,
} from "@/services/domain"
import {
  swrKeyStartsWith,
  swrKeys,
  useCompaniesSWR,
  useJourneysSWR,
  useUsersSWR,
} from "@/hooks/swr"

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
  const [invite, setInvite] = useState<UserInviteApiItem>(makeInitialInvite)

  const { mutate: mutateSWRCache } = useSWRConfig()
  const { data: companyItems = [], isLoading: isLoadingCompanies } =
    useCompaniesSWR()
  const { data: employeeItems = [], isLoading: isLoadingEmployees } =
    useUsersSWR()
  const { data: journeyItems = [], isLoading: isLoadingJourneys } =
    useJourneysSWR()

  const companies = useMemo(
    () => companyItems.map(mapCompanyApiToCompany),
    [companyItems]
  )
  const employees = useMemo(
    () => employeeItems.map(mapUserApiToEmployee),
    [employeeItems]
  )
  const journeys = useMemo(
    () => journeyItems.map(mapJourneyApiToJourney),
    [journeyItems]
  )
  const isLoading =
    isLoadingCompanies || isLoadingEmployees || isLoadingJourneys

  async function revalidateManagementData() {
    await Promise.all([
      mutateSWRCache(swrKeyStartsWith(swrKeys.companies.list())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.users.list())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.journeys.list())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.analytics.dashboard())),
    ])
  }

  async function removeEntity(view: ManagementTabId, id: number) {
    try {
      if (view === "companies") {
        await deleteCompany(id)
        await revalidateManagementData()
        return
      }

      if (view === "employees") {
        await deleteUser(id)
        await revalidateManagementData()
        return
      }

      await deleteJourney(id)
      await revalidateManagementData()
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
        await updateCompany(entity.id, payload)
        await revalidateManagementData()
        return
      }

      await createCompany(payload)
      await revalidateManagementData()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async function saveEmployee(entity: Employee | null, form: EmployeeForm) {
    try {
      const payload = buildEmployeePayload(form)

      if (entity) {
        await updateUser(entity.id, payload)
        await revalidateManagementData()
        return
      }

      const createdEmployeeResponse = await createUser(payload)
      setInvite(createdEmployeeResponse.invite)
      await revalidateManagementData()
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
        await updateJourney(entity.id, payload)
        await revalidateManagementData()
        return
      }

      await createJourney(payload)
      await revalidateManagementData()
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
