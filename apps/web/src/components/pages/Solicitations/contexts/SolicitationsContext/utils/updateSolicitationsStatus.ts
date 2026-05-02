import type { Solicitation, SolicitationStatus } from "../../../types"

export function updateSolicitationsStatus(
  solicitations: Solicitation[],
  id: number,
  status: SolicitationStatus
) {
  return solicitations.map((solicitation) =>
    solicitation.id === id ? { ...solicitation, status } : solicitation
  )
}
