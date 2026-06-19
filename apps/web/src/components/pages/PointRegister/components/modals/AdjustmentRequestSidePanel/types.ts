import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { AdjustmentRequestApiItem } from "@/services/domain"
import type { PointRecord } from "../../../types"

export type AdjustmentRequestSidePanelMethods = SidePanelMethods

export interface AdjustmentRequestSidePanelProps {
  records: PointRecord[]
  targetUserId?: number
  workdayDate?: string
  onSubmitted?: (request: AdjustmentRequestApiItem) => Promise<void> | void
}
