import type { WorkdayApiItem } from "@/services/domain"

export function calculateWorkedSeconds(
  entries: WorkdayApiItem["timeEntries"],
  now: Date
) {
  let totalSeconds = 0
  let openEntryAt: Date | null = null

  for (const entry of [...entries].sort(
    (left, right) =>
      new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  )) {
    const recordedAt = new Date(entry.recordedAt)

    if (Number.isNaN(recordedAt.getTime())) continue

    if (entry.kind === "ENTRY") {
      openEntryAt = recordedAt
      continue
    }

    if (!openEntryAt) continue

    totalSeconds += Math.max(
      0,
      Math.floor((recordedAt.getTime() - openEntryAt.getTime()) / 1000)
    )

    openEntryAt = null
  }

  if (openEntryAt) {
    totalSeconds += Math.max(
      0,
      Math.floor((now.getTime() - openEntryAt.getTime()) / 1000)
    )
  }

  return totalSeconds
}
