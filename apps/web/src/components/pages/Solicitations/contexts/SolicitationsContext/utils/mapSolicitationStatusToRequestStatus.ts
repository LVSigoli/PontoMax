import type { SolicitationStatus } from "../../../types"

export function mapSolicitationStatusToRequestStatus(status: SolicitationStatus) {
  return status === "Aprovado" ? "APPROVED" : "REJECTED"
}
