import { PONTO_MAX_API } from "../../api"
import { HttpRequest, HttpResponse } from "./types"

export async function postLogin(payload: HttpRequest) {
  const url = "auth/login"

  const response = await PONTO_MAX_API.post<HttpResponse>(url, payload)

  return response.data
}
