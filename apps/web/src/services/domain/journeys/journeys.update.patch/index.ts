import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, JourneyApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function updateJourney(journeyId: number, payload: HttpRequest) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<JourneyApiItem>>(
    `work-schedules/${journeyId}`,
    payload
  )

  return response.data.item
}
