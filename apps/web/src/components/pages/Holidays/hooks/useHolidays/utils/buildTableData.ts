import type {
  TableCellData,
  TableRowData,
} from "@/components/structure/Table/types"
import { Holiday } from "../../../types"
import {
  formatHolidayCompanies,
  formatHolidayDate,
  getHolidayStatusClass,
} from "../../../utils"

export function buildTableData(holidays: Holiday[]) {
  return holidays.map<TableRowData>((holiday) => ({
    "Nome do feriado": { value: holiday.name },
    Data: { value: formatHolidayDate(holiday.date) },
    Tipo: { value: holiday.type },
    Empresas: { value: formatHolidayCompanies(holiday) },
    Status: buildStatus(holiday),
  }))
}

function buildStatus(holiday: Holiday): TableCellData {
  return {
    value: holiday.status,
    type: "badge",
    color: getHolidayStatusClass(holiday.status),
  }
}
