import type { HolidayScope, HolidayWithCompanies } from "./holidays.types.js"

export function serializeHoliday(holiday: HolidayWithCompanies) {
  const companies = holiday.companyAssignments.map(({ company }) => ({
    id: company.id,
    name: company.tradeName ?? company.name,
  }))

  return {
    id: holiday.id,
    name: holiday.name,
    date: holiday.date,
    type: holiday.type,
    isActive: holiday.isActive,
    companyIds: companies.map((company) => company.id),
    companies,
  }
}

export function toHolidayScope(holiday: HolidayWithCompanies): HolidayScope {
  return {
    date: holiday.date,
    type: holiday.type,
    companyIds: holiday.companyAssignments.map(
      (assignment) => assignment.companyId
    ),
  }
}
