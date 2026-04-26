import type { Holiday, HolidayForm, HolidayStatus } from "./types"
import type { HolidayApiItem } from "@/services/domain"

export function formatHolidayDate(value: string) {
  if (!value) return "-"

  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value

  return `${day}/${month}/${year}`
}

export function getHolidayStatusClass(status: HolidayStatus) {
  if (status === "Inativo") return "bg-danger-50 text-danger-700"

  return "bg-success-50 text-success-700"
}

export function makeHolidayForm(holiday?: Holiday | null): HolidayForm {
  return {
    name: holiday?.name ?? "",
    date: holiday?.date ?? "",
    type: holiday?.type ?? "Nacional",
  }
}

export function mapHolidayApiToHoliday(holiday: HolidayApiItem): Holiday {
  return {
    id: holiday.id,
    companyId: holiday.companyId,
    name: holiday.name,
    date: holiday.date.slice(0, 10),
    type: mapHolidayTypeFromApi(holiday.type),
    status: holiday.isActive ? "Ativo" : "Inativo",
  }
}

export function mapHolidayTypeToApi(type: HolidayForm["type"]): HolidayApiItem["type"] {
  if (type === "Nacional") return "NATIONAL"
  if (type === "Municipal") return "MUNICIPAL"

  return "STATE"
}

function mapHolidayTypeFromApi(type: HolidayApiItem["type"]) {
  if (type === "NATIONAL") return "Nacional"
  if (type === "MUNICIPAL") return "Municipal"

  return "Estadual"
}
