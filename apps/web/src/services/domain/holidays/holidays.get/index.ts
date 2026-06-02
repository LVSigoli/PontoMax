import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, HolidayApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getHolidays(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<ApiListResponse<HolidayApiItem>>(
    "holidays",
    {
      params,
    }
  )

  return response.data.items
}
