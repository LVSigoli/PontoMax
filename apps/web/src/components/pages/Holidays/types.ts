export type HolidayType = "Nacional" | "Municipal" | "Estadual"
export type HolidayStatus = "Ativo" | "Inativo"

export interface HolidayCompany {
  id: number
  name: string
}

export interface Holiday {
  id: number
  companyIds: number[]
  companies: HolidayCompany[]
  name: string
  date: string
  type: HolidayType
  status: HolidayStatus
}

export interface HolidayForm {
  name: string
  date: string
  type: HolidayType
  companyIds: number[]
}
