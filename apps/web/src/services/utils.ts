export function formatMinutes(value: number) {
  const sign = value < 0 ? "-" : value > 0 ? "+" : ""
  const absoluteValue = Math.abs(value)
  const hours = Math.floor(absoluteValue / 60)
  const minutes = absoluteValue % 60

  return `${sign}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}min`
}

export function formatHoursWithMinutes(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}min`
}

export function formatDateLabel(value: string | Date) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatTimeLabel(value: string | Date) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
