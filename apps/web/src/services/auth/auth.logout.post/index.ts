import { PONTO_MAX_API } from "@/services/api"

export async function postLogout(refreshToken: string) {
  await PONTO_MAX_API.post("auth/logout", { refreshToken })
}
