import type {
  SolicitationPointType,
  SolicitationStatus,
} from "./types"

export function formatSolicitationDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function getSolicitationStatusClass(status: SolicitationStatus) {
  if (status === "Pendente") return "bg-warning-50 text-warning-700"
  if (status === "Recusado") return "bg-danger-50 text-danger-700"

  return "bg-success-50 text-success-700"
}

export function getPointTypeClass(type: SolicitationPointType) {
  return type === "Entrada" ? "text-success-700" : "text-danger-700"
}
