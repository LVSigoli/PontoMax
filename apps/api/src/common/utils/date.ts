const MINUTES_IN_HOUR = 60;

export function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * MINUTES_IN_HOUR + minutes;
}

export function parseTimeStringToDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const [hours = '00', minutes = '00'] = value.split(':');
  return new Date(`1970-01-01T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000Z`);
}

export function minutesToTime(value: number) {
  const hours = Math.floor(value / MINUTES_IN_HOUR)
    .toString()
    .padStart(2, '0');
  const minutes = (value % MINUTES_IN_HOUR).toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function getDateOnly(value: Date | string) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function startOfDay(value: Date | string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: Date | string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}
