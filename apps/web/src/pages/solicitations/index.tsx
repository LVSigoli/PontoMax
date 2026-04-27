// Components
import { Solicitations } from "@/components/pages/Solicitations"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function SolicitationsPage() {
  return withAuthentication(<Solicitations />)
}
