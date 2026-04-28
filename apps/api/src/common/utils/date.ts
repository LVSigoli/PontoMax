const MINUTES_IN_HOUR = 60;
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

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

export function getDateOnly(value: Date | string, timeZone = DEFAULT_TIMEZONE) {
  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    }
  }

  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? date.getUTCFullYear());
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? date.getUTCMonth() + 1);
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? date.getUTCDate());

  return new Date(Date.UTC(year, month - 1, day));
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
