export interface HttpRequest {
  name?: string
  description?: string
  scaleCode?: string
  flexibleSchedule?: boolean
  dailyWorkMinutes?: number
  weeklyWorkMinutes?: number
  expectedEntryTime?: string
  expectedExitTime?: string
  breakMinutes?: number
  toleranceMinutes?: number
  nightShift?: boolean
  isActive?: boolean
}
