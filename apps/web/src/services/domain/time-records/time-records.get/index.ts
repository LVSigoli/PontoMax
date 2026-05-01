import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, WorkdayApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getTimeRecords(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<ApiListResponse<WorkdayApiItem>>(
    "time-records",
    {
      params,
    }
  )

  return response.data.items
}
