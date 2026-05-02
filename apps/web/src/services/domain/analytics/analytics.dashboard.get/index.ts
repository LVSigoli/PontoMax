import { PONTO_MAX_API } from "@/services/api"

import type { AnalyticsDashboardResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function getAnalyticsDashboard(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<AnalyticsDashboardResponse>(
    "analytics/dashboard",
    {
      params,
    }
  )

  return response.data
}
