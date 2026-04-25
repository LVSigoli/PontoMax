import { PointRegister } from "@/components/pages/PointRegister"
import { withAuthentication } from "@/hooks/withAuthentication"

export default function PointPage() {
  return withAuthentication(<PointRegister />)
}
