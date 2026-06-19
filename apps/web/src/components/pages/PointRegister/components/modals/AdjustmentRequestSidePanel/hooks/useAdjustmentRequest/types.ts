import { PointRecord } from "@/components/pages/PointRegister/types"

export interface UseAdjustmentRequestParams {
  records: PointRecord[]
  targetUserId?: number
  workdayDate?: string
  onSubmitted?: () => Promise<void> | void
}

export interface AdjustmentRequestForm {
  justification: string
  records: PointRecord[]
}
