import { PONTO_MAX_API } from "@/services/api"

import type { ApiListResponse, UserApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function getUsers(params?: HttpRequest) {
  const response = await PONTO_MAX_API.get<ApiListResponse<UserApiItem>>(
    "users",
    {
      params,
    }
  )

  return response.data.items
}
