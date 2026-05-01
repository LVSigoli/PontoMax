import { PONTO_MAX_API } from "@/services/api"

export async function deleteHoliday(holidayId: number) {
  await PONTO_MAX_API.delete(`holidays/${holidayId}`)
}
