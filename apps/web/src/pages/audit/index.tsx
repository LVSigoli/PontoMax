// Components
import { Audit } from "@/components/pages/Audit"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function AuditPage() {
  return withAuthentication(<Audit />, [
    "PLATFORM_ADMIN",
    "COMPANY_ADMIN",
  ])
}
