// Components
import { History } from "@/components/pages/History"

// Hookes
import { withAuthentication } from "@/hooks/withAuthentication"

export default function HistoryPage() {
  return withAuthentication(<History />)
}
