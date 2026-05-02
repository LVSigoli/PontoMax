import { PONTO_MAX_API } from "@/services/api"

import type { AdjustmentRequestApiItem, ApiItemResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function createAdjustmentRequest(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<
    ApiItemResponse<AdjustmentRequestApiItem>
  >("adjustment-requests", payload)

  return response.data.item
}
