export interface UserWithCurrentJourney {
  id: number
  companyId: number
  employeeCode: string | null
  fullName: string
  email: string
  cpf: string
  role: string
  position: string | null
  isActive: boolean
  company: {
    name: string
  }
  journeyAssignments: Array<{
    journeyId: number
    journey: {
      name: string
    }
  }>
}

export function serializeUser(user: UserWithCurrentJourney) {
  return {
    id: user.id,
    companyId: user.companyId,
    companyName: user.company.name,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    position: user.position,
    isActive: user.isActive,
    journeyId: user.journeyAssignments[0]?.journeyId ?? null,
    journeyName: user.journeyAssignments[0]?.journey.name ?? null,
  }
}

export function buildUserAuditSnapshot(user: {
  companyId: number
  employeeCode: string | null
  fullName: string
  email: string
  cpf: string
  role: string
  position: string | null
  isActive: boolean
  journeyAssignments: Array<{
    journeyId: number
  }>
}) {
  return {
    companyId: user.companyId,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    position: user.position,
    isActive: user.isActive,
    journeyId: user.journeyAssignments[0]?.journeyId ?? null,
  }
}
