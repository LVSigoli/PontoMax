import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, HolidayApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function updateHoliday(holidayId: number, payload: HttpRequest) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<HolidayApiItem>>(
    `holidays/${holidayId}`,
    payload
  )

  return response.data.item
}
