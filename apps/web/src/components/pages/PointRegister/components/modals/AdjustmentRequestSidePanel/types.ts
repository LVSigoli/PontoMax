import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { PointRecord } from "../../../types"

export type AdjustmentRequestSidePanelMethods = SidePanelMethods

export interface AdjustmentRequestSidePanelProps {
  records: PointRecord[]
  onSubmitted?: () => Promise<void> | void
}
