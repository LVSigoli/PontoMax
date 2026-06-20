export function serializeCompany(company: {
  id: number
  clientId: number
  name: string
  legalName: string
  tradeName: string | null
  cnpj: string
  timezone: string
  isActive: boolean
  client: { name: string }
  _count: { users: number }
}) {
  return {
    id: company.id,
    clientId: company.clientId,
    clientName: company.client.name,
    name: company.name,
    legalName: company.legalName,
    tradeName: company.tradeName,
    cnpj: company.cnpj,
    timezone: company.timezone,
    isActive: company.isActive,
    employees: company._count.users,
  }
}

export function companyAuditSnapshot(company: {
  clientId: number
  name: string
  legalName: string
  tradeName: string | null
  cnpj: string
  timezone: string
  isActive: boolean
}) {
  return {
    clientId: company.clientId,
    name: company.name,
    legalName: company.legalName,
    tradeName: company.tradeName,
    cnpj: company.cnpj,
    timezone: company.timezone,
    isActive: company.isActive,
  }
}
