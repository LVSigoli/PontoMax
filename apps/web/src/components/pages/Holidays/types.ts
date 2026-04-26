export type HolidayType = "Nacional" | "Municipal" | "Estadual"
export type HolidayStatus = "Ativo" | "Inativo"

export interface Holiday {
  id: number
  companyId?: number
  name: string
  date: string
  type: HolidayType
  status: HolidayStatus
}

export type HolidayForm = Omit<Holiday, "id" | "status">
