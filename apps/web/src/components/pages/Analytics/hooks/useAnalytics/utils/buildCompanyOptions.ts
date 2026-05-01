import { CompanyApiItem } from "@/services/domain"

export function buildCompanyOptions(companies: CompanyApiItem[]) {
  return [
    { value: "all", label: "Todas as empresas" },
    ...companies.map((company) => ({
      value: String(company.id),
      label: company.tradeName || company.name,
    })),
  ]
}
