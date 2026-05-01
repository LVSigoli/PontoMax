import { PONTO_MAX_API } from "@/services/api"

import type { WorkdayOverviewSummaryApiItem } from "../../types"

export async function getTimeRecordsSummary() {
  const response = await PONTO_MAX_API.get<{
    summary: WorkdayOverviewSummaryApiItem
  }>("time-records/summary")

  return response.data.summary
}
