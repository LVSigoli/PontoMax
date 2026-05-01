import { ManagementEntity } from "../../../types"

export function makeInitialEntity(): ManagementEntity {
  return {
    id: 0,
    clientId: 0,
    legalName: "",
    tradeName: "",
    name: "",
    cnpj: "",
    timezone: "",
    isActive: false,
    employees: 0,
  }
}
