export interface HttpRequest {
  name?: string
  description?: string
  scaleCode?: string
  flexibleSchedule?: boolean
  dailyWorkMinutes?: number
  weeklyWorkMinutes?: number
  expectedEntryTime?: string | null
  expectedExitTime?: string | null
  breakMinutes?: number
  toleranceMinutes?: number
  nightShift?: boolean
  isActive?: boolean
}
