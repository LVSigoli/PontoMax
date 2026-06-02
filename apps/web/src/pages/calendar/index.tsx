// Components
import { HolidayCalendar } from "@/components/pages/HolidayCalendar"

// Hooks
import { withAuthentication } from "@/hooks/withAuthentication"

export default function CalendarPage() {
  return withAuthentication(<HolidayCalendar />)
}
