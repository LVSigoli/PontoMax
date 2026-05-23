import type { TimeEntryLocationApiItem } from "@/services/domain"

export type PointRecordStatus =
  | "Registrado"
  | "Pendente"
  | "Atrasado"
  | "Falta"
  | "Aprovado"

export type PointRecordType = "Entrada" | "Saida"

export interface PointRecord {
  id: number
  workdayId?: number
  workdayDate?: string
  timeEntryId?: number
  recordedAt?: string
  location?: TimeEntryLocationApiItem | null
  time: string
  workedHours: string
  extraHours: string
  missingHours: string
  type: PointRecordType
  status: PointRecordStatus
}

export interface WorkdaySummary {
  id: number
  workdayDate: string
  workedHours: string
  extraHours: string
  missingHours: string
  recordsCount: number
  status: PointRecordStatus
  records: PointRecord[]
}
