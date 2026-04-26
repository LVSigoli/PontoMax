import { PONTO_MAX_API } from "../api"
import type {
  AdjustmentRequestApiItem,
  AnalyticsDashboardResponse,
  ApiItemResponse,
  ApiListResponse,
  CompanyApiItem,
  HolidayApiItem,
  JourneyApiItem,
  RegisterTimeRecordResponse,
  TeamTodayApiItem,
  UserApiItem,
  WorkdayApiItem,
} from "./types"

export async function getCompanies() {
  const response = await PONTO_MAX_API.get<ApiListResponse<CompanyApiItem>>("companies")
  return response.data.items
}

export async function createCompany(payload: {
  clientId: number
  name: string
  legalName: string
  tradeName?: string
  cnpj: string
  timezone: string
}) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<CompanyApiItem>>(
    "companies",
    payload
  )

  return response.data.item
}

export async function updateCompany(
  companyId: number,
  payload: Partial<{
    clientId: number
    name: string
    legalName: string
    tradeName: string
    cnpj: string
    timezone: string
    isActive: boolean
  }>
) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<CompanyApiItem>>(
    `companies/${companyId}`,
    payload
  )

  return response.data.item
}

export async function deleteCompany(companyId: number) {
  await PONTO_MAX_API.delete(`companies/${companyId}`)
}

export async function getUsers() {
  const response = await PONTO_MAX_API.get<ApiListResponse<UserApiItem>>("users")
  return response.data.items
}

export async function createUser(payload: {
  companyId?: number
  employeeCode?: string
  fullName: string
  email: string
  cpf: string
  password?: string
  role: string
  position?: string
  isActive?: boolean
  journeyId?: number
  journeyValidFrom?: string
}) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<UserApiItem>>("users", payload)
  return response.data.item
}

export async function updateUser(
  userId: number,
  payload: Partial<{
    employeeCode: string
    fullName: string
    email: string
    cpf: string
    password: string
    role: string
    position: string
    isActive: boolean
    journeyId: number
    journeyValidFrom: string
  }>
) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<UserApiItem>>(
    `users/${userId}`,
    payload
  )

  return response.data.item
}

export async function deleteUser(userId: number) {
  await PONTO_MAX_API.delete(`users/${userId}`)
}

export async function getJourneys() {
  const response =
    await PONTO_MAX_API.get<ApiListResponse<JourneyApiItem>>("work-schedules")

  return response.data.items
}

export async function createJourney(payload: {
  companyId?: number
  name: string
  description?: string
  scaleCode: string
  flexibleSchedule?: boolean
  dailyWorkMinutes: number
  weeklyWorkMinutes?: number
  expectedEntryTime?: string
  expectedExitTime?: string
  breakMinutes?: number
  toleranceMinutes?: number
  nightShift?: boolean
  isActive?: boolean
}) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<JourneyApiItem>>(
    "work-schedules",
    payload
  )

  return response.data.item
}

export async function updateJourney(
  journeyId: number,
  payload: Partial<{
    name: string
    description: string
    scaleCode: string
    flexibleSchedule: boolean
    dailyWorkMinutes: number
    weeklyWorkMinutes: number
    expectedEntryTime: string
    expectedExitTime: string
    breakMinutes: number
    toleranceMinutes: number
    nightShift: boolean
    isActive: boolean
  }>
) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<JourneyApiItem>>(
    `work-schedules/${journeyId}`,
    payload
  )

  return response.data.item
}

export async function deleteJourney(journeyId: number) {
  await PONTO_MAX_API.delete(`work-schedules/${journeyId}`)
}

export async function getHolidays() {
  const response = await PONTO_MAX_API.get<ApiListResponse<HolidayApiItem>>("holidays")
  return response.data.items
}

export async function createHoliday(payload: {
  companyId?: number
  name: string
  date: string
  type: HolidayApiItem["type"]
  isActive?: boolean
}) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<HolidayApiItem>>(
    "holidays",
    payload
  )

  return response.data.item
}

export async function updateHoliday(
  holidayId: number,
  payload: Partial<{
    name: string
    date: string
    type: HolidayApiItem["type"]
    isActive: boolean
  }>
) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<HolidayApiItem>>(
    `holidays/${holidayId}`,
    payload
  )

  return response.data.item
}

export async function deleteHoliday(holidayId: number) {
  await PONTO_MAX_API.delete(`holidays/${holidayId}`)
}

export async function getTimeRecords(params?: { from?: string; to?: string }) {
  const response = await PONTO_MAX_API.get<ApiListResponse<WorkdayApiItem>>("time-records", {
    params,
  })

  return response.data.items
}

export async function registerTimeRecord(payload?: {
  recordedAt?: string
  kind?: "ENTRY" | "EXIT"
  timezone?: string
}) {
  const response = await PONTO_MAX_API.post<RegisterTimeRecordResponse>(
    "time-records/register",
    payload ?? {}
  )

  return response.data
}

export async function getTeamToday() {
  const response =
    await PONTO_MAX_API.get<ApiListResponse<TeamTodayApiItem>>("time-records/team/today")

  return response.data.items
}

export async function getAdjustmentRequests(params?: {
  status?: AdjustmentRequestApiItem["status"]
  from?: string
  to?: string
}) {
  const response = await PONTO_MAX_API.get<ApiListResponse<AdjustmentRequestApiItem>>(
    "adjustment-requests",
    {
      params,
    }
  )

  return response.data.items
}

export async function createAdjustmentRequest(payload: {
  workdayDate: string
  justification: string
  records: Array<{
    timeEntryId?: number
    actionType: "CREATE" | "UPDATE" | "DELETE"
    targetKind: "ENTRY" | "EXIT"
    originalRecordedAt?: string
    newRecordedAt?: string
    reason?: string
  }>
}) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<AdjustmentRequestApiItem>>(
    "adjustment-requests",
    payload
  )

  return response.data.item
}

export async function reviewAdjustmentRequest(
  requestId: number,
  payload: { status: "APPROVED" | "REJECTED"; reviewNotes?: string }
) {
  const response = await PONTO_MAX_API.patch(
    `adjustment-requests/${requestId}/review`,
    payload
  )

  return response.data
}

export async function getAnalyticsDashboard() {
  const response =
    await PONTO_MAX_API.get<AnalyticsDashboardResponse>("analytics/dashboard")

  return response.data
}
