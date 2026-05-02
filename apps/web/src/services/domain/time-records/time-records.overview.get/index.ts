import { PONTO_MAX_API } from "@/services/api"

import type { WorkdayOverviewResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function getTimeRecordsOverview(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<WorkdayOverviewResponse>(
    "time-records/overview",
    {
      params,
    }
  )

  return response.data
}
