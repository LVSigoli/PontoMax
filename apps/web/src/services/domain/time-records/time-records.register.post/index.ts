import { PONTO_MAX_API } from "@/services/api"

import type { RegisterTimeRecordResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function registerTimeRecord(payload?: HttpRequest) {
  const response = await PONTO_MAX_API.post<RegisterTimeRecordResponse>(
    "time-records/register",
    payload ?? {}
  )

  return response.data
}
