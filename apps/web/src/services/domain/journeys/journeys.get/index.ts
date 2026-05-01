import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, JourneyApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getJourneys(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<ApiListResponse<JourneyApiItem>>(
    "work-schedules",
    {
      params,
    }
  )

  return response.data.items
}
