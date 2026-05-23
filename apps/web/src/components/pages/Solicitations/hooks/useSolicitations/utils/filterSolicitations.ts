import type { Solicitation } from "../../../types"
import type { SolicitationStatusFilter } from "../types"

interface Params {
  search: string
  solicitations: Solicitation[]
}

export function filterSolicitations({
  search,
  solicitations,
}: Params) {
  const normalizedSearch = search.trim().toLowerCase()

  return solicitations.filter((solicitation) => {
    const matchesSearch = solicitation.userName
      .toLowerCase()
      .includes(normalizedSearch)

    return matchesSearch
  })
}
