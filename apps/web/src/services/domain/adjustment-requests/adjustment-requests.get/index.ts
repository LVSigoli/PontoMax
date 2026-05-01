import { PONTO_MAX_API } from "@/services/api"

import type { AdjustmentRequestApiItem, ApiListResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function getAdjustmentRequests(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<
    ApiListResponse<AdjustmentRequestApiItem>
  >("adjustment-requests", {
    params,
  })

  return response.data.items
}
