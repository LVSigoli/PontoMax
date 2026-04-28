import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { PointRecord } from "../../../types"

export type AdjustmentRequestSidePanelMethods = SidePanelMethods

export interface AdjustmentRequestSidePanelProps {
  records: PointRecord[]
  workdayDate?: string
  onSubmitted?: () => Promise<void> | void
}
