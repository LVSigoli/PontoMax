import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, CompanyApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function createCompany(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<ApiItemResponse<CompanyApiItem>>(
    "companies",
    payload
  )

  return response.data.item
}
