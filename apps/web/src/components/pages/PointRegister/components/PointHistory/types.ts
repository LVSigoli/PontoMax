// Types
import { PointRecord } from "../../types"

export interface Props {
  onAdjustmentRequest?: (record: PointRecord) => void
  onRecordSelect?: (record: PointRecord) => void
  records: PointRecord[]
}
