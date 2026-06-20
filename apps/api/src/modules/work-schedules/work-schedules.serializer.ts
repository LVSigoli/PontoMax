export function journeyAuditSnapshot(journey: {
  companyId: number
  name: string
  description: string | null
  scaleCode: string
  flexibleSchedule: boolean
  dailyWorkMinutes: number
  weeklyWorkMinutes: number | null
  expectedEntryTime: Date | null
  expectedExitTime: Date | null
  breakMinutes: number
  toleranceMinutes: number
  nightShift: boolean
  isActive: boolean
}) {
  return {
    companyId: journey.companyId,
    name: journey.name,
    description: journey.description,
    scaleCode: journey.scaleCode,
    flexibleSchedule: journey.flexibleSchedule,
    dailyWorkMinutes: journey.dailyWorkMinutes,
    weeklyWorkMinutes: journey.weeklyWorkMinutes,
    expectedEntryTime: journey.expectedEntryTime,
    expectedExitTime: journey.expectedExitTime,
    breakMinutes: journey.breakMinutes,
    toleranceMinutes: journey.toleranceMinutes,
    nightShift: journey.nightShift,
    isActive: journey.isActive,
  }
}
