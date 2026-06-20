import type { Company, Employee, Journey } from "../../types"

export const ALL_OPTION_VALUE = "__all__"

export function buildRemovalKey(tabId: string, entityId: number) {
  return `${tabId}:${entityId}:remove`
}

export function matchesCompanySearch(company: Company, search: string) {
  const normalizedSearch = normalizeSearch(search)
  if (!normalizedSearch) return true

  return [
    company.name,
    company.tradeName ?? "",
    company.legalName ?? "",
    company.cnpj,
  ].some((value) => value.toLowerCase().includes(normalizedSearch))
}

export function matchesEmployeeSearch(params: {
  companies: Company[]
  employee: Employee
  journeys: Journey[]
  search: string
}) {
  const normalizedSearch = normalizeSearch(params.search)
  if (!normalizedSearch) return true

  const companyName =
    params.companies.find((company) => company.id === params.employee.companyId)
      ?.name ?? "-"
  const journeyName =
    params.journeys.find((journey) => journey.id === params.employee.journeyId)
      ?.name ?? "-"

  return [
    params.employee.name,
    params.employee.email,
    params.employee.role,
    companyName,
    journeyName,
  ].some((value) => value.toLowerCase().includes(normalizedSearch))
}

export function matchesJourneySearch(journey: Journey, search: string) {
  const normalizedSearch = normalizeSearch(search)
  if (!normalizedSearch) return true

  return [journey.name, journey.description ?? "", journey.scale].some(
    (value) => value.toLowerCase().includes(normalizedSearch)
  )
}

function normalizeSearch(search: string) {
  return search.trim().toLowerCase()
}
