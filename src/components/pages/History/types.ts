export type UserAnalysisType = "worked-days" | "hour-balance" | "pending" | "issues"

export type SolicitationStatus = "Inconsistente" | "Registrado" | "Recusado"

export interface UserAnalysisItem {
  label: string
  data: string
  type: UserAnalysisType
  subtitle: string
}

export interface SolicitationHistoryItem {
  id: number
  lastSolicitationTime: string
  extraHours: string
  missingHours: string
  status: SolicitationStatus
}
