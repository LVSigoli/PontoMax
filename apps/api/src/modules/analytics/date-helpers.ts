export function subDays(value: Date, days: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() - days,
    ),
  );
}
