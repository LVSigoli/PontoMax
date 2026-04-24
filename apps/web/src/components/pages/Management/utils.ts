import type { SelectionOption } from "@/components/structure/Select/types"
import type {
  Company,
  CompanyForm,
  Employee,
  EmployeeForm,
  Journey,
  JourneyForm,
  ManagementTabId,
} from "./types"

export function makeCompanyForm(company?: Company): CompanyForm {
  return {
    name: company?.name ?? "",
    cnpj: company?.cnpj ?? "",
  }
}

export function makeEmployeeForm(
  companies: Company[],
  journeys: Journey[],
  employee?: Employee
): EmployeeForm {
  return {
    name: employee?.name ?? "",
    cpf: employee?.cpf ?? "",
    email: employee?.email ?? "",
    role: employee?.role ?? "",
    companyId: employee?.companyId ?? companies[0]?.id ?? 0,
    journeyId: employee?.journeyId ?? journeys[0]?.id ?? 0,
    managerAccess: employee?.managerAccess ?? false,
  }
}

export function makeJourneyForm(journey?: Journey): JourneyForm {
  return {
    name: journey?.name ?? "",
    flexible: journey?.flexible ?? false,
    startTime: journey?.startTime ?? "",
    endTime: journey?.endTime ?? "",
    interval: journey?.interval ?? "",
    scale: journey?.scale ?? "5X2",
  }
}

export function formatTimeLabel(value: string) {
  if (!value) return "-"

  const [hours = "00", minutes = "00"] = value.split(":")
  return `${hours}h ${minutes}min`
}

export function getCompanyName(companies: Company[], id: number) {
  return companies.find((company) => company.id === id)?.name ?? "-"
}

export function getJourneyName(journeys: Journey[], id: number) {
  return journeys.find((journey) => journey.id === id)?.name ?? "-"
}

export function makeCompanyOptions(companies: Company[]): SelectionOption[] {
  return companies.map((company) => ({
    value: String(company.id),
    label: company.name,
  }))
}

export function makeJourneyOptions(journeys: Journey[]): SelectionOption[] {
  return journeys.map((journey) => ({
    value: String(journey.id),
    label: journey.name,
  }))
}

export function getEntityLabel(tab: ManagementTabId) {
  if (tab === "companies") return "empresa"
  if (tab === "employees") return "funcionario"

  return "jornada"
}
