import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, HolidayApiItem } from "../../types"

export async function getHolidays() {
  const response = await PONTO_MAX_API.get<ApiListResponse<HolidayApiItem>>(
    "holidays"
  )

  return response.data.items
}
