import type { AdjustmentRequestApiItem } from "../../types"

export interface HttpRequest {
  companyId?: number
  status?: AdjustmentRequestApiItem["status"]
  from?: string
  to?: string
}
