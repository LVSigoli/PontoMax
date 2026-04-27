// Components
import { Management } from "@/components/pages/Management"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function ManagementPage() {
  return withAuthentication(<Management />)
}
