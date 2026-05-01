import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, JourneyApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function createJourney(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<JourneyApiItem>>(
    "work-schedules",
    payload
  )

  return response.data.item
}
