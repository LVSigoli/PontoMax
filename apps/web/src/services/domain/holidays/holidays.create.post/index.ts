import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, HolidayApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function createHoliday(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<HolidayApiItem>>(
    "holidays",
    payload
  )

  return response.data.item
}
