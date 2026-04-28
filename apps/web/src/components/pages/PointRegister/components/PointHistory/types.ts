import { WorkdaySummary } from "../../types"

export interface Props {
  onAdjustmentRequest?: (record: WorkdaySummary) => void
  onRecordSelect?: (record: WorkdaySummary) => void
  records: WorkdaySummary[]
}
