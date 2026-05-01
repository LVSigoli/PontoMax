import { PONTO_MAX_API } from "@/services/api"
import { HttpResponse } from "./response"

export async function getCurrentUser() {
  const response = await PONTO_MAX_API.get<HttpResponse>("auth/me")

  return response.data
}
