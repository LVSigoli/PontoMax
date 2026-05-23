// External Libraries
import { createContext, useContext, useEffect, useMemo } from "react"
import { useSWRConfig } from "swr"

import { useToastContext } from "@/contexts/ToastContext"
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
import { getErrorMessage } from "@/utils/getErrorMessage"

// Utils
import {
  buildCompanyPayload,
  buildEmployeePayload,
  buildJourneyPayload,
  mapCompanyApiToCompany,
  mapJourneyApiToJourney,
  mapUserApiToEmployee,
} from "../../utils"

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
  const { showToast } = useToastContext()
  const { mutate: mutateSWRCache } = useSWRConfig()
  const {
    data: companyItems = [],
    error: companiesError,
    isLoading: isLoadingCompanies,
  } = useCompaniesSWR()
  const {
    data: employeeItems = [],
    error: employeesError,
    isLoading: isLoadingEmployees,
  } = useUsersSWR()
  const {
    data: journeyItems = [],
    error: journeysError,
    isLoading: isLoadingJourneys,
  } = useJourneysSWR()

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
  const managementLoadError =
    companiesError ?? employeesError ?? journeysError

  useEffect(() => {
    if (!managementLoadError) return

    showToast({
      variant: "error",
      message: getErrorMessage(
        managementLoadError,
        "Nao foi possivel carregar os dados de gerenciamento."
      ),
    })
  }, [managementLoadError, showToast])

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
        showToast({
          variant: "success",
          message: "Empresa removida com sucesso.",
        })
        return
      }

      if (view === "employees") {
        await deleteUser(id)
        await revalidateManagementData()
        showToast({
          variant: "success",
          message: "Funcionario removido com sucesso.",
        })
        return
      }

      await deleteJourney(id)
      await revalidateManagementData()
      showToast({
        variant: "success",
        message: "Jornada removida com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          getManagementErrorMessage(view, "delete")
        ),
      })
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
        showToast({
          variant: "success",
          message: "Empresa atualizada com sucesso.",
        })
        return
      }

      await createCompany(payload)
      await revalidateManagementData()
      showToast({
        variant: "success",
        message: "Empresa criada com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, getManagementErrorMessage("companies", "save")),
      })
      throw error
    }
  }

  async function saveEmployee(entity: Employee | null, form: EmployeeForm) {
    try {
      const payload = buildEmployeePayload(form)

      if (entity) {
        await updateUser(entity.id, payload)
        await revalidateManagementData()
        showToast({
          variant: "success",
          message: "Funcionario atualizado com sucesso.",
        })
        return
      }

      await createUser(payload)
      await revalidateManagementData()
      showToast({
        variant: "success",
        message: "Funcionario criado com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, getManagementErrorMessage("employees", "save")),
      })
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
        showToast({
          variant: "success",
          message: "Jornada atualizada com sucesso.",
        })
        return
      }

      await createJourney(payload)
      await revalidateManagementData()
      showToast({
        variant: "success",
        message: "Jornada criada com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, getManagementErrorMessage("journeys", "save")),
      })
      throw error
    }
  }

  const value: ManagementContextValue = {
    isLoading,
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

function getManagementErrorMessage(
  view: ManagementTabId,
  action: "delete" | "save"
) {
  if (view === "companies") {
    return action === "delete"
      ? "Nao foi possivel remover a empresa."
      : "Nao foi possivel salvar a empresa."
  }

  if (view === "employees") {
    return action === "delete"
      ? "Nao foi possivel remover o funcionario."
      : "Nao foi possivel salvar o funcionario."
  }

  return action === "delete"
    ? "Nao foi possivel remover a jornada."
    : "Nao foi possivel salvar a jornada."
}
