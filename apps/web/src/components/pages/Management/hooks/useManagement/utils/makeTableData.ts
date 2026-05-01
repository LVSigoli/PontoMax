// Utils
import { getCompanyName, getJourneyName } from "../../../utils"

// Type
import { TableRowData } from "@/components/structure/Table/types"
import { formatTimeLabel } from "@/services/utils"
import { Company, Employee, Journey, ManagementTabId } from "../../../types"

interface MakeTableDataParams {
  tab: ManagementTabId
  companies: Company[]
  employees: Employee[]
  journeys: Journey[]
}

export function makeTableData(params: MakeTableDataParams) {
  const { tab, companies, employees, journeys } = params
  if (tab === "companies") {
    return companies.map<TableRowData>((company) => ({
      Empresa: { value: company.name },
      CNPJ: { value: company.cnpj },
      Funcionarios: {
        value: company.employees,
        type: "badge",
        color: "bg-success-50 text-success-700",
      },
    }))
  }

  if (tab === "employees") {
    return employees.map<TableRowData>((employee) => ({
      Nome: { value: employee.name },
      Email: { value: employee.email },
      Cargo: { value: employee.role },
      Empresa: { value: getCompanyName(companies, employee.companyId) },
      Jornada: { value: getJourneyName(journeys, employee.journeyId) },
    }))
  }

  return journeys.map<TableRowData>((journey) => ({
    Nome: { value: journey.name },
    Entrada: { value: formatTimeLabel(journey.startTime) },
    Saida: { value: formatTimeLabel(journey.endTime) },
    Intervalo: { value: formatTimeLabel(journey.interval) },
    Escala: { value: journey.scale },
    Funcionarios: {
      value: journey.employees,
      type: "badge",
      color: "bg-success-50 text-success-700",
    },
  }))
}
