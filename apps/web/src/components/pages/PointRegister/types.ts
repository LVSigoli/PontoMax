export type PointRecordStatus = "Registrado" | "Pendente" | "Aprovado"

export type PointRecordType = "Entrada" | "Saída"

export interface PointRecord {
  id: number
  time: string
  workedHours: string
  extraHours: string
  missingHours: string
  type: PointRecordType
  status: PointRecordStatus
}
