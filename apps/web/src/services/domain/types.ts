export interface ApiListResponse<T> {
  items: T[]
}

export interface ApiItemResponse<T> {
  item: T
}

export interface CompanyApiItem {
  id: number
  clientId: number
  clientName: string
  name: string
  legalName: string
  tradeName: string | null
  cnpj: string
  timezone: string
  isActive: boolean
  employees: number
}

export interface UserApiItem {
  id: number
  companyId: number
  companyName: string
  employeeCode: string | null
  fullName: string
  email: string
  cpf: string
  role: string
  position: string | null
  isActive: boolean
  journeyId: number | null
  journeyName: string | null
}

export interface JourneyApiItem {
  id: number
  companyId: number
  name: string
  description: string | null
  scaleCode: string
  flexibleSchedule: boolean
  dailyWorkMinutes: number
  weeklyWorkMinutes: number | null
  expectedEntryTime: string | null
  expectedExitTime: string | null
  breakMinutes: number
  toleranceMinutes: number
  nightShift: boolean
  isActive: boolean
  employees: number
}

export interface HolidayApiItem {
  id: number
  companyId: number
  name: string
  date: string
  type: "NATIONAL" | "STATE" | "MUNICIPAL" | "COMPANY"
  isActive: boolean
}

export interface TimeEntryApiItem {
  id: number
  kind: "ENTRY" | "EXIT"
  source: "WEB" | "MOBILE" | "MANUAL" | "ADJUSTMENT"
  status: "ACTIVE" | "PENDING_REVIEW" | "SUPERSEDED" | "REJECTED"
  sequence: number
  timezone: string
  recordedAt: string
}

export interface WorkdayApiItem {
  id: number
  date: string
  status: "OPEN" | "CLOSED" | "INCONSISTENT" | "PENDING_ADJUSTMENT" | "ADJUSTED"
  scheduledMinutes: number
  workedMinutes: number
  overtimeMinutes: number
  missingMinutes: number
  nightMinutes: number
  isHoliday: boolean
  timeEntries: TimeEntryApiItem[]
}

export interface RegisterTimeRecordResponse {
  entry: TimeEntryApiItem
  workday: WorkdayApiItem
}

export interface TeamTodayApiItem {
  userId: number
  userName: string
  status: "OPEN" | "CLOSED" | "INCONSISTENT" | "PENDING_ADJUSTMENT" | "ADJUSTED"
  workedMinutes: number
  lastEntryAt: string | null
}

export interface AdjustmentPointApiItem {
  id: number
  adjustmentRequestId: number
  timeEntryId: number | null
  actionType: "CREATE" | "UPDATE" | "DELETE"
  targetKind: "ENTRY" | "EXIT"
  originalRecordedAt: string | null
  newRecordedAt: string | null
  reason: string | null
  createdAt: string
}

export interface AdjustmentRequestApiItem {
  id: number
  companyId: number
  userId: number
  workdayId: number
  reviewedById: number | null
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  justification: string
  reviewNotes: string | null
  requestedAt: string
  reviewedAt: string | null
  requestedBy?: {
    fullName: string
  }
  pointAdjustments: AdjustmentPointApiItem[]
  workday?: {
    date: string
  }
}

export interface AnalyticsDashboardResponse {
  metrics: {
    presentEmployees: number
    companyEmployees: number
    overtimeMinutes: number
    pendingAdjustments: number
    inconsistentWorkdays: number
  }
  balances: Array<{
    id: number
    name: string
    balanceMinutes: number
  }>
  solicitationChart: Array<{
    label: string
    approved: number
    pending: number
    refused: number
  }>
  workedHours: Array<{
    label: string
    hours: number
  }>
}
