import type { PointRecordStatus, PointRecordType } from "./types"

export const getPointTypeClass = (type: PointRecordType) => {
  return type === "Entrada" ? "text-success-700" : "text-danger-700"
}

export const getPointStatusClass = (status: PointRecordStatus) => {
  if (status === "Pendente") return "bg-warning-50 text-warning-700"

  return "bg-success-50 text-success-700"
}

export const formatPointDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export const formatPointTime = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}
