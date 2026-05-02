import { PONTO_MAX_API } from "@/services/api"

export async function deleteJourney(journeyId: number) {
  await PONTO_MAX_API.delete(`work-schedules/${journeyId}`)
}
