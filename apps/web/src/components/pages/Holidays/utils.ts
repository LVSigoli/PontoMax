import type { Holiday, HolidayForm, HolidayStatus } from "./types"

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
