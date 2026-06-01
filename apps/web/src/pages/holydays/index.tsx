// Components
import { useEffect } from "react"

import { useRouter } from "next/router"

import { withAuthentication } from "@/hooks/withAuthentication"

function HolydaysRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    void router.replace("/holidays")
  }, [router])

  return null
}

export default function HolydaysPage() {
  return withAuthentication(<HolydaysRedirectPage />, [
    "PLATFORM_ADMIN",
    "COMPANY_ADMIN",
  ])
}
