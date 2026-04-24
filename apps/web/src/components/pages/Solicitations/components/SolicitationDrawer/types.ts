import type { Solicitation } from "../../types"

export interface SolicitationDrawerMethods {
  close: () => void
  open: () => void
  toggle: () => void
}

export interface Props {
  element: Solicitation | null
}
