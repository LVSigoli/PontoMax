// Components
import { Holidays } from "@/components/pages/Holidays"
import { withAuthentication } from "@/hooks/withAuthentication"

export default function HolydaysPage() {
  return withAuthentication(<Holidays />)
}
