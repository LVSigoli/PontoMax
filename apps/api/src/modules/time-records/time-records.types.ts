import type {
  Journey,
  TimeEntry,
  UserJourneyAssignment,
  Workday,
} from "@prisma/client"

export type JourneyAssignmentWithJourney = UserJourneyAssignment & {
  journey: Journey
}

export type WorkdayLike = Pick<
  Workday,
  | "id"
  | "date"
  | "status"
  | "scheduledMinutes"
  | "workedMinutes"
  | "overtimeMinutes"
  | "missingMinutes"
  | "nightMinutes"
  | "isHoliday"
> & {
  timeEntries?: TimeEntry[]
}

export interface WorkdayOverviewSummary {
  workedDays: number
  balanceMinutes: number
  inconsistentCount: number
  pendingAdjustments: number
}

export interface WorkdayOverviewResponse {
  items: Array<{
    id: number
    date: string
    status: string
    scheduledMinutes: number
    workedMinutes: number
    overtimeMinutes: number
    missingMinutes: number
    nightMinutes: number
    isHoliday: boolean
    timeEntries: ReturnType<
      typeof import("./time-records.serializer.js").serializeTimeEntry
    >[]
  }>
  meta: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface TimeEntryLocationInput {
  latitude: number
  longitude: number
  accuracyMeters?: number
}
