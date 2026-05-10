import { PONTO_MAX_API } from "@/services/api"

import type { ApiPaginatedResponse, AuditLogApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getAuditLogs(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<ApiPaginatedResponse<AuditLogApiItem>>(
    "audit-logs",
    {
      params,
    }
  )

  return response.data
}
