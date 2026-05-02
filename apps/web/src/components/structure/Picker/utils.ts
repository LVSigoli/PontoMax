import type {
  CalendarDay,
  DurationDraft,
  PickerFieldProps,
  PickerPeriod,
  PickerType,
  PickerVariant,
  TimeDraft,
} from "./types"

const PICKER_PANEL_DIMENSIONS: Record<
  PickerType,
  { width: number; height: number }
> = {
  date: { width: 280, height: 320 },
  time: { width: 180, height: 180 },
  interval: { width: 180, height: 164 },
  dateTime: { width: 280, height: 440 },
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

export function getPickerPanelDimensions(type: PickerType) {
  return PICKER_PANEL_DIMENSIONS[type]
}

export function getPickerIconName(type: PickerType): PickerFieldProps["iconName"] {
  if (type === "date" || type === "dateTime") return "calendar"

  return "clock"
}

export function getPickerPlaceholder(type: PickerType, variant: PickerVariant) {
  if (variant === "table") {
    if (type === "date") return "dd/mm/aaaa"
    if (type === "dateTime") return "dd/mm/aaaa 00:00"

    return "00:00"
  }

  if (type === "date") return "Selecione a data"
  if (type === "dateTime") return "Selecione a data e hora"

  return "00 h 00min"
}

export function getPickerDisplayValue(
  type: PickerType,
  value: string | Date,
  variant: PickerVariant
) {
  if (type === "date") return formatDateDisplay(value)
  if (type === "time") return formatTimeDisplay(value, variant)
  if (type === "interval") return formatDurationDisplay(value, variant)
  if (type === "dateTime") return formatDateTimeDisplay(value, variant)

  return ""
}

export function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatDateTimeValue(date: Date) {
  const dateValue = formatDateValue(date)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${dateValue}T${hours}:${minutes}`
}

export function parseDateValue(value: string | Date) {
  if (value instanceof Date) return new Date(value)
  if (!value) return null

  const datePart = value.split("T")[0]
  const [year, month, day] = datePart.split("-").map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export function parseTimeValue(value: string | Date) {
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
  }

  if (!value) return ""

  const timePart = value.includes("T") ? value.split("T")[1] ?? "" : value

  return timePart.slice(0, 5)
}

export function formatMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getWeekdayLabels() {
  return WEEKDAY_LABELS
}

export function buildCalendarDays(referenceDate: Date): CalendarDay[] {
  const firstDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  )
  const firstGridDate = new Date(firstDay)

  firstGridDate.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate)
    date.setDate(firstGridDate.getDate() + index)

    return {
      key: formatDateValue(date),
      date,
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
    }
  })
}

export function getInitialCalendarMonth(value: string | Date) {
  return parseDateValue(value) ?? new Date()
}

export function isSameCalendarDay(left: Date | null, right: Date) {
  if (!left) return false

  return formatDateValue(left) === formatDateValue(right)
}

export function normalizeDigitInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 2)
}

export function padNumber(value: string) {
  return value.padStart(2, "0")
}

export function clampInputValue(value: string, min: number, max: number) {
  if (!value) return ""

  const numericValue = Number(value)
  const clampedValue = Math.min(max, Math.max(min, numericValue))

  return padNumber(String(clampedValue))
}

export function parseTimeDraft(value: string | Date): TimeDraft {
  const timeValue = parseTimeValue(value)
  if (!timeValue) {
    return {
      hour: "",
      minute: "",
      period: "AM",
    }
  }

  const [hours = "00", minutes = "00"] = timeValue.split(":")
  const numericHours = Number(hours)
  const period: PickerPeriod = numericHours >= 12 ? "PM" : "AM"
  const normalizedHours = numericHours % 12 || 12

  return {
    hour: hours ? padNumber(String(normalizedHours)) : "",
    minute: minutes ? padNumber(minutes) : "",
    period,
  }
}

export function parseDurationDraft(value: string | Date): DurationDraft {
  const [hours = "", minutes = ""] = parseTimeValue(value).split(":")

  return {
    hour: hours ? padNumber(hours) : "",
    minute: minutes ? padNumber(minutes) : "",
  }
}

export function buildTimeValue(draft: TimeDraft) {
  if (!draft.hour || !draft.minute) return ""

  const hourValue = Number(draft.hour)
  const minuteValue = Number(draft.minute)

  if (
    Number.isNaN(hourValue) ||
    Number.isNaN(minuteValue) ||
    hourValue < 1 ||
    hourValue > 12 ||
    minuteValue < 0 ||
    minuteValue > 59
  ) {
    return ""
  }

  const normalizedHours =
    draft.period === "PM"
      ? hourValue === 12
        ? 12
        : hourValue + 12
      : hourValue === 12
        ? 0
        : hourValue

  return `${padNumber(String(normalizedHours))}:${padNumber(String(minuteValue))}`
}

export function buildDurationValue(draft: DurationDraft) {
  if (!draft.hour || !draft.minute) return ""

  const hourValue = Number(draft.hour)
  const minuteValue = Number(draft.minute)

  if (
    Number.isNaN(hourValue) ||
    Number.isNaN(minuteValue) ||
    hourValue < 0 ||
    hourValue > 23 ||
    minuteValue < 0 ||
    minuteValue > 59
  ) {
    return ""
  }

  return `${padNumber(String(hourValue))}:${padNumber(String(minuteValue))}`
}

export function buildDateTimeFromParts(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return ""

  return `${dateValue}T${timeValue}`
}

export function formatDateDisplay(value: string | Date) {
  const date = parseDateValue(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export function formatTimeDisplay(
  value: string | Date,
  variant: PickerVariant = "default"
) {
  const timeValue = parseTimeValue(value)
  if (!timeValue) return ""

  const [hours = "00", minutes = "00"] = timeValue.split(":")
  if (variant === "table") return `${hours}:${minutes}`

  return `${hours} h ${minutes}min`
}

export function formatDurationDisplay(
  value: string | Date,
  variant: PickerVariant = "default"
) {
  const durationValue = parseTimeValue(value)
  if (!durationValue) return ""

  const [hours = "00", minutes = "00"] = durationValue.split(":")
  if (variant === "table") return `${hours}:${minutes}`

  return `${hours} h ${minutes}min`
}

export function formatDateTimeDisplay(
  value: string | Date,
  variant: PickerVariant = "default"
) {
  const date = parseDateValue(value)
  const timeValue = parseTimeValue(value)

  if (!date || !timeValue) return ""

  if (variant === "table") {
    return `${formatDateDisplay(date)} ${timeValue}`
  }

  return `${formatDateDisplay(date)} às ${formatTimeDisplay(timeValue)}`
}
