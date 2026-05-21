import { PONTO_MAX_API } from "@/services/api"

import type { HttpRequest } from "./request"
import type { HttpResponse } from "./response"

export async function postForgotPassword(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<HttpResponse>(
    "auth/forgot-password",
    payload
  )

  return response.data
}
