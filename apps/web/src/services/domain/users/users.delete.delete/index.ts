import { PONTO_MAX_API } from "@/services/api"

export async function deleteUser(userId: number) {
  await PONTO_MAX_API.delete(`users/${userId}`)
}
