export function subDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() - days);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}
