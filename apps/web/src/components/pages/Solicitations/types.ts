export type SolicitationStatus = "Pendente" | "Aprovado" | "Recusado"
export type SolicitationPointType = "Entrada" | "Saida"

export interface SolicitationPoint {
  id: number
  timeEntryId?: number
  time: string
  type: SolicitationPointType
  originalRecordedAt?: string
  newRecordedAt?: string
  actionType?: "CREATE" | "UPDATE" | "DELETE"
}

export interface Solicitation {
  id: number
  requestId?: number
  userName: string
  requestDate: string
  requestedAt: string
  justification: string
  status: SolicitationStatus
  points: SolicitationPoint[]
  reviewNotes?: string | null
}
