import type { HolidayApiItem } from "../../types"

export interface HttpRequest {
  companyId?: number
  name: string
  date: string
  type: HolidayApiItem["type"]
  isActive?: boolean
}
