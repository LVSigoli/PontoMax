import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, TeamTodayApiItem } from "../../types"

export async function getTeamToday() {
  const response = await PONTO_MAX_API.get<ApiListResponse<TeamTodayApiItem>>(
    "time-records/team/today"
  )

  return response.data.items
}
