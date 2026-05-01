import { PONTO_MAX_API } from "@/services/api"

export async function deleteCompany(companyId: number) {
  await PONTO_MAX_API.delete(`companies/${companyId}`)
}
