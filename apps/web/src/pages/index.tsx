import { PointRegister } from "@/components/pages/PointRegister"
import { withAuthentication } from "@/hooks/withAuthentication"

export default function IndexPage() {
  return withAuthentication(<PointRegister />)
}
