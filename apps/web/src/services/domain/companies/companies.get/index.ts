import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, CompanyApiItem } from "../../types"

export async function getCompanies() {
  const response = await PONTO_MAX_API.get<ApiListResponse<CompanyApiItem>>(
    "companies"
  )

  return response.data.items
}
