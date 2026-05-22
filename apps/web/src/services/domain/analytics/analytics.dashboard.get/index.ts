import { PONTO_MAX_API } from "@/services/api"

import type { AnalyticsDashboardResponse } from "../../types"
import type { AnalyticsDashboardRequest } from "./request"

export async function getAnalyticsDashboard(params?: AnalyticsDashboardRequest) {
  const response = await PONTO_MAX_API.get<AnalyticsDashboardResponse>(
    "analytics/dashboard",
    {
      params,
    }
  )

  return response.data
}
