import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, CompanyApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function updateCompany(companyId: number, payload: HttpRequest) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<CompanyApiItem>>(
    `companies/${companyId}`,
    payload
  )

  return response.data.item
}
