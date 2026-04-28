import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { WorkdaySummary } from "../../../types"

export type DayHistorySidePanelMethods = SidePanelMethods

export interface DayHistorySidePanelProps {
  record: WorkdaySummary | null
}
