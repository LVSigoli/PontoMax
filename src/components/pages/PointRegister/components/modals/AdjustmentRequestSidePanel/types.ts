import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { PointRecord, PointRecordType } from "../../../types"

export type AdjustmentRequestSidePanelMethods = SidePanelMethods

export interface AdjustmentRequestSidePanelProps {
  justification: string
  records: PointRecord[]
  onAddRecord: () => void
  onCancel: () => void
  onConfirm: () => void
  onJustificationChange: (value: string) => void
  onRecordRemove: (id: number) => void
  onRecordTimeChange: (id: number, value: string) => void
  onRecordTypeChange: (id: number, value: PointRecordType) => void
}
