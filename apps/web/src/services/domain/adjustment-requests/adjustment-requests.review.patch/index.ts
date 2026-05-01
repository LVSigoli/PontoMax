import { PONTO_MAX_API } from "@/services/api"

import type { HttpRequest } from "./request"

export async function reviewAdjustmentRequest(
  requestId: number,
  payload: HttpRequest
) {
  const response = await PONTO_MAX_API.patch(
    `adjustment-requests/${requestId}/review`,
    payload
  )

  return response.data
}
