import type { HolidayApiItem } from "../../types"

export interface HttpRequest {
  companyIds?: number[]
  name: string
  date: string
  type: HolidayApiItem["type"]
  isActive?: boolean
}
