export function serializeAdjustmentWorkday<T extends { date: Date }>(
  workday: T
) {
  return {
    ...workday,
    date: workday.date.toISOString().slice(0, 10),
  }
}
