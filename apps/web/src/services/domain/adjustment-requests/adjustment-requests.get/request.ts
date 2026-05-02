import type { AdjustmentRequestApiItem } from "../../types"

export interface HttpRequest {
  status?: AdjustmentRequestApiItem["status"]
  from?: string
  to?: string
}
