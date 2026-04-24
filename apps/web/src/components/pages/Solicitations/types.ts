export type SolicitationStatus = "Pendente" | "Aprovado" | "Recusado"
export type SolicitationPointType = "Entrada" | "Saida"

export interface SolicitationPoint {
  id: number
  time: string
  type: SolicitationPointType
}

export interface Solicitation {
  id: number
  userName: string
  requestDate: string
  requestedAt: string
  justification: string
  status: SolicitationStatus
  points: SolicitationPoint[]
}
