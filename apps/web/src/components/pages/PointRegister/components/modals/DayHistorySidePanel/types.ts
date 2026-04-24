import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { PointRecord } from "../../../types"

export type DayHistorySidePanelMethods = SidePanelMethods

export interface DayHistorySidePanelProps {
  record: PointRecord | null
}
