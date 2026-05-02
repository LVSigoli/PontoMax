import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, WorkdayApiItem } from "../../types"

export async function getTodayTimeRecords() {
  const response = await PONTO_MAX_API.get<ApiItemResponse<WorkdayApiItem>>(
    "time-records/today"
  )

  return response.data.item
}
