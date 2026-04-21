import type { Solicitation } from "../../types"

export interface Props {
  solicitation: Solicitation
  onClick: (solicitation: Solicitation) => void
}
