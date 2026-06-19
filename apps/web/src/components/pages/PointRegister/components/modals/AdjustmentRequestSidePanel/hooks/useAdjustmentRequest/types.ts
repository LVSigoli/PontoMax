import { PointRecord } from "@/components/pages/PointRegister/types"
import type { AdjustmentRequestApiItem } from "@/services/domain"

export interface UseAdjustmentRequestParams {
  records: PointRecord[]
  targetUserId?: number
  workdayDate?: string
  onSubmitted?: (request: AdjustmentRequestApiItem) => Promise<void> | void
}

export interface AdjustmentRequestForm {
  justification: string
  records: PointRecord[]
}
