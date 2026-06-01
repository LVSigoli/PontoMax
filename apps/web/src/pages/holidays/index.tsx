// Components
import { Holidays } from "@/components/pages/Holidays"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function HolidaysPage() {
  return withAuthentication(<Holidays />, [
    "PLATFORM_ADMIN",
    "COMPANY_ADMIN",
  ])
}
