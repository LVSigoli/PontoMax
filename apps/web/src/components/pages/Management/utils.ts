import type { SelectionOption } from "@/components/structure/Select/types"
import type {
  CompanyApiItem,
  JourneyApiItem,
  UserApiItem,
} from "@/services/domain"
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
    clientId: company?.clientId,
    legalName: company?.legalName ?? company?.name ?? "",
    tradeName: company?.tradeName ?? "",
    name: company?.name ?? "",
    cnpj: company?.cnpj ?? "",
    timezone: company?.timezone ?? "America/Sao_Paulo",
    isActive: company?.isActive ?? true,
  }
}

export function makeEmployeeForm(
  companies: Company[],
  journeys: Journey[],
  employee?: Employee
): EmployeeForm {
  return {
    userRole: employee?.userRole ?? "EMPLOYEE",
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
    description: journey?.description ?? "",
    flexible: journey?.flexible ?? false,
    startTime: journey?.startTime ?? "",
    endTime: journey?.endTime ?? "",
    interval: journey?.interval ?? "",
    scale: journey?.scale ?? "5X2",
    companyId: journey?.companyId,
    dailyWorkMinutes: journey?.dailyWorkMinutes ?? 0,
    weeklyWorkMinutes: journey?.weeklyWorkMinutes ?? undefined,
    toleranceMinutes: journey?.toleranceMinutes ?? 10,
    nightShift: journey?.nightShift ?? false,
    isActive: journey?.isActive ?? true,
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

export function mapCompanyApiToCompany(company: CompanyApiItem): Company {
  return {
    id: company.id,
    clientId: company.clientId,
    legalName: company.legalName,
    tradeName: company.tradeName,
    name: company.name,
    cnpj: company.cnpj,
    timezone: company.timezone,
    isActive: company.isActive,
    employees: company.employees,
  }
}

export function mapUserApiToEmployee(user: UserApiItem): Employee {
  return {
    id: user.id,
    userRole: user.role,
    name: user.fullName,
    cpf: user.cpf,
    email: user.email,
    role: user.position ?? user.role,
    companyId: user.companyId,
    journeyId: user.journeyId ?? 0,
    managerAccess:
      user.role === "MANAGER" ||
      user.role === "CLIENT_ADMIN" ||
      user.role === "COMPANY_ADMIN",
  }
}

export function mapJourneyApiToJourney(journey: JourneyApiItem): Journey {
  const startTime = formatApiTime(journey.expectedEntryTime)
  const endTime = formatApiTime(journey.expectedExitTime)

  return {
    id: journey.id,
    companyId: journey.companyId,
    name: journey.name,
    description: journey.description,
    flexible: journey.flexibleSchedule,
    startTime,
    endTime,
    interval: minutesToClock(journey.breakMinutes),
    scale: journey.scaleCode,
    dailyWorkMinutes: journey.dailyWorkMinutes,
    weeklyWorkMinutes: journey.weeklyWorkMinutes ?? undefined,
    toleranceMinutes: journey.toleranceMinutes,
    nightShift: journey.nightShift,
    isActive: journey.isActive,
    employees: journey.employees,
  }
}

export function buildCompanyPayload(form: CompanyForm & { clientId: number }) {
  return {
    clientId: form.clientId,
    legalName: form.legalName || form.name,
    tradeName: form.tradeName || form.name,
    name: form.name,
    cnpj: form.cnpj,
    timezone: form.timezone || "America/Sao_Paulo",
    isActive: form.isActive,
  }
}

export function buildEmployeePayload(form: EmployeeForm) {
  const companyId =
    typeof form.companyId === "number" && form.companyId > 0
      ? form.companyId
      : undefined
  const journeyId =
    typeof form.journeyId === "number" && form.journeyId > 0
      ? form.journeyId
      : undefined

  return {
    companyId,
    fullName: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    cpf: form.cpf,
    position: form.role.trim() || undefined,
    role: form.managerAccess ? "COMPANY_ADMIN" : "EMPLOYEE",
    journeyId,
    journeyValidFrom: journeyId ? new Date().toISOString().slice(0, 10) : undefined,
  }
}

export function buildJourneyPayload(form: JourneyForm) {
  const dailyWorkMinutes =
    form.dailyWorkMinutes && form.dailyWorkMinutes > 0
      ? form.dailyWorkMinutes
      : calculateJourneyWorkMinutes(form.startTime, form.endTime, form.interval)
  const isFlexible = form.flexible

  return {
    companyId:
      typeof form.companyId === "number" && form.companyId > 0
        ? form.companyId
        : undefined,
    name: form.name,
    description: form.description || undefined,
    scaleCode: form.scale,
    flexibleSchedule: isFlexible,
    dailyWorkMinutes,
    weeklyWorkMinutes: form.weeklyWorkMinutes ?? undefined,
    expectedEntryTime: isFlexible ? null : form.startTime || undefined,
    expectedExitTime: isFlexible ? null : form.endTime || undefined,
    breakMinutes: isFlexible ? 0 : clockToMinutes(form.interval),
    toleranceMinutes: form.toleranceMinutes ?? 10,
    nightShift: form.nightShift ?? false,
    isActive: form.isActive ?? true,
  }
}

function formatApiTime(value?: string | null) {
  if (!value) return ""

  const [datePart, timePart] = value.split("T")
  if (timePart) {
    return timePart.slice(0, 5)
  }

  return datePart.slice(0, 5)
}

export function minutesToClock(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function clockToMinutes(value: string) {
  if (!value) return 0

  const [hours = "0", minutes = "0"] = value.split(":")

  return Number(hours) * 60 + Number(minutes)
}

function calculateJourneyWorkMinutes(startTime: string, endTime: string, interval: string) {
  if (!startTime || !endTime) return 0

  const start = clockToMinutes(startTime)
  const end = clockToMinutes(endTime)
  const breakMinutes = clockToMinutes(interval)

  const total = end >= start ? end - start : 24 * 60 - start + end

  return Math.max(0, total - breakMinutes)
}
