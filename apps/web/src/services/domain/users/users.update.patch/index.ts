import { PONTO_MAX_API } from "@/services/api"

import type { ApiItemResponse, UserApiItem } from "../../types"
import type { HttpRequest } from "./request"

export async function updateUser(userId: number, payload: HttpRequest) {
  const response = await PONTO_MAX_API.patch<ApiItemResponse<UserApiItem>>(
    `users/${userId}`,
    payload
  )

  return response.data.item
}
