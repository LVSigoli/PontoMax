import { PONTO_MAX_API } from "@/services/api"
import { HttppRequest } from "./request"

export async function postResetPassword(payload: HttppRequest) {
  await PONTO_MAX_API.post("auth/reset-password", payload)
}
