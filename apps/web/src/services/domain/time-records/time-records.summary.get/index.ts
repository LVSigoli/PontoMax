import { PONTO_MAX_API } from "@/services/api"

import type { WorkdayOverviewSummaryApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getTimeRecordsSummary(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<{
    summary: WorkdayOverviewSummaryApiItem
  }>("time-records/summary", {
    params,
  })

  return response.data.summary
}
