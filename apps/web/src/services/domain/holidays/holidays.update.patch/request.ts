import type { HolidayApiItem } from "../../types"

export interface HttpRequest {
  name?: string
  date?: string
  type?: HolidayApiItem["type"]
  isActive?: boolean
}
