import { WorkdayApiItem, WorkdayOverviewResponse } from "@/services/domain"

export function buildHistoryRecords(
  current: WorkdayApiItem[],
  incoming: WorkdayOverviewResponse
) {
  const nextRecords = [...current]
  const existingIds = new Set(current.map((record) => record.id))

  for (const item of incoming.items) {
    if (!existingIds.has(item.id)) nextRecords.push(item)
  }

  return nextRecords
}
