import type { Solicitation } from "../../../types"
import type { SolicitationStatusFilter } from "../types"

interface Params {
  search: string
  solicitations: Solicitation[]
  statusFilter: SolicitationStatusFilter
}

export function filterSolicitations({
  search,
  solicitations,
  statusFilter,
}: Params) {
  const normalizedSearch = search.trim().toLowerCase()

  return solicitations.filter((solicitation) => {
    const matchesSearch = solicitation.userName
      .toLowerCase()
      .includes(normalizedSearch)
    const matchesStatus =
      statusFilter === "all" || solicitation.status === statusFilter

    return matchesSearch && matchesStatus
  })
}
