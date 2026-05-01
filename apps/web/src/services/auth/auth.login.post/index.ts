import { PONTO_MAX_API } from "@/services/api"
import { LoginResponse } from "@/types"
import { HttpRequest } from "./request"

export async function postLogin(payload: HttpRequest) {
  const response = await PONTO_MAX_API.post<LoginResponse>(
    "auth/login",
    payload
  )
  return response.data
}
