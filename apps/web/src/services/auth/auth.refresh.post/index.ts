import { PONTO_MAX_API } from "@/services/api"
import { AuthSession } from "@/types"

export async function postRefresh(refreshToken: string) {
  const response = await PONTO_MAX_API.post<AuthSession>("auth/refresh", {
    refreshToken,
  })
  return response.data
}
