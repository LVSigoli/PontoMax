import type {
  SolicitationPointType,
  SolicitationStatus,
} from "./types"
import type { AdjustmentRequestApiItem } from "@/services/domain"
import { formatDateLabel, formatTimeLabel } from "@/services/utils"

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

export function mapSolicitationStatus(status: AdjustmentRequestApiItem["status"]): SolicitationStatus {
  if (status === "APPROVED") return "Aprovado"
  if (status === "REJECTED") return "Recusado"

  return "Pendente"
}

export function mapAdjustmentApiToSolicitation(item: AdjustmentRequestApiItem) {
  return {
    id: item.id,
    requestId: item.id,
    userName: item.requestedBy?.fullName ?? "Usuario",
    requestDate: item.workday?.date ?? item.requestedAt.slice(0, 10),
    requestedAt: formatDateLabel(item.requestedAt),
    justification: item.justification,
    status: mapSolicitationStatus(item.status),
    reviewNotes: item.reviewNotes,
    points: item.pointAdjustments.map((point) => ({
      id: point.id,
      timeEntryId: point.timeEntryId ?? undefined,
      time: formatTimeLabel(point.newRecordedAt ?? point.originalRecordedAt ?? item.requestedAt),
      type: (point.targetKind === "ENTRY"
        ? "Entrada"
        : "Saida") as SolicitationPointType,
      originalRecordedAt: point.originalRecordedAt ?? undefined,
      newRecordedAt: point.newRecordedAt ?? undefined,
      actionType: point.actionType,
    })),
  }
}
