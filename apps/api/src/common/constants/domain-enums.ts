export const USER_ROLES = [
  "PLATFORM_ADMIN",
  "COMPANY_ADMIN",
  "EMPLOYEE",
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ADMIN_ROLES = ["PLATFORM_ADMIN", "COMPANY_ADMIN"] as const

const LEGACY_COMPANY_ADMIN_ROLES = ["CLIENT_ADMIN", "MANAGER"] as const

export const HOLIDAY_TYPES = [
  "NATIONAL",
  "STATE",
  "MUNICIPAL",
  "COMPANY",
] as const
export type HolidayType = (typeof HOLIDAY_TYPES)[number]

export const WORKDAY_STATUSES = [
  "OPEN",
  "CLOSED",
  "INCONSISTENT",
  "LATE",
  "PENDING_ADJUSTMENT",
  "ADJUSTED",
] as const
export type WorkdayStatus = (typeof WORKDAY_STATUSES)[number]

export const TIME_ENTRY_KINDS = ["ENTRY", "EXIT"] as const
export type TimeEntryKind = (typeof TIME_ENTRY_KINDS)[number]

export const TIME_ENTRY_SOURCES = [
  "WEB",
  "MOBILE",
  "MANUAL",
  "ADJUSTMENT",
] as const
export type TimeEntrySource = (typeof TIME_ENTRY_SOURCES)[number]

export const TIME_ENTRY_STATUSES = [
  "ACTIVE",
  "PENDING_REVIEW",
  "SUPERSEDED",
  "REJECTED",
] as const
export type TimeEntryStatus = (typeof TIME_ENTRY_STATUSES)[number]

export const ADJUSTMENT_REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const
export type AdjustmentRequestStatus =
  (typeof ADJUSTMENT_REQUEST_STATUSES)[number]

export const ADJUSTMENT_ACTION_TYPES = ["CREATE", "UPDATE", "DELETE"] as const
export type AdjustmentActionType = (typeof ADJUSTMENT_ACTION_TYPES)[number]

export const SESSION_STATUSES = ["ACTIVE", "REVOKED", "EXPIRED"] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const AUDIT_LOG_ENTITY_TYPES = [
  "AUTH",
  "USER",
  "COMPANY",
  "JOURNEY",
  "HOLIDAY",
  "TIME_RECORD",
  "ADJUSTMENT_REQUEST",
] as const
export type AuditLogEntityType =
  (typeof AUDIT_LOG_ENTITY_TYPES)[number]

export const AUDIT_LOG_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "RESET_PASSWORD",
  "REGISTER",
  "APPROVE",
  "REJECT",
] as const
export type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number]

function isEnumValue<T extends readonly string[]>(
  values: T,
  value: string
): value is T[number] {
  return values.includes(value)
}

export function toUserRole(value: string): UserRole {
  if (!isEnumValue(USER_ROLES, value)) {
    if (LEGACY_COMPANY_ADMIN_ROLES.includes(value as (typeof LEGACY_COMPANY_ADMIN_ROLES)[number])) {
      return "COMPANY_ADMIN"
    }

    throw new Error(`Invalid user role: ${value}`)
  }

  return value
}

export function toTimeEntryKind(value: string): TimeEntryKind {
  if (!isEnumValue(TIME_ENTRY_KINDS, value)) {
    throw new Error(`Invalid time entry kind: ${value}`)
  }

  return value
}
