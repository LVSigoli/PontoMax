import { PONTO_MAX_API } from "@/services/api"

import type { CreateUserApiResponse } from "../../types"
import type { HttpRequest } from "./request"

export async function createUser(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<CreateUserApiResponse>(
    "users",
    payload
  )

  return response.data
}
