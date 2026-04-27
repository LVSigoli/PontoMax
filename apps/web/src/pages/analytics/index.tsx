// Components
import { Analytics } from "@/components/pages/Analytics"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function AnalyticsPage() {
  return withAuthentication(<Analytics />)
}
