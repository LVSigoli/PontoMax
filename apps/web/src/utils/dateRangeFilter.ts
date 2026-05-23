import type { SelectionOption } from "@/components/structure/Select/types"

export type DateRangePreset =
  | "today"
  | "last7Days"
  | "last30Days"
  | "currentMonth"
  | "custom"

export interface DateRangeValue {
  from: string
  to: string
}

export const DEFAULT_DATE_RANGE_PRESET: DateRangePreset = "last30Days"

export const DATE_RANGE_PRESET_OPTIONS: SelectionOption[] = [
  { value: "today", label: "Hoje" },
  { value: "last7Days", label: "Ultimos 7 dias" },
  { value: "last30Days", label: "Ultimos 30 dias" },
  { value: "currentMonth", label: "Mes atual" },
  { value: "custom", label: "Personalizado" },
]

export function resolveDateRangePreset(
  preset: DateRangePreset,
  referenceDate = new Date()
): DateRangeValue {
  const anchorDate = new Date(referenceDate)

  if (preset === "today") {
    const value = buildDateInputValue(anchorDate)

    return {
      from: value,
      to: value,
    }
  }

  if (preset === "last30Days") {
    return {
      from: buildDateInputValue(addDays(anchorDate, -29)),
      to: buildDateInputValue(anchorDate),
    }
  }

  if (preset === "currentMonth") {
    return {
      from: buildDateInputValue(
        new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
      ),
      to: buildDateInputValue(anchorDate),
    }
  }

  return {
    from: buildDateInputValue(addDays(anchorDate, -6)),
    to: buildDateInputValue(anchorDate),
  }
}

export function formatDateRangeSummary(
  preset: DateRangePreset,
  range: DateRangeValue
) {
  if (preset !== "custom") {
    const option = DATE_RANGE_PRESET_OPTIONS.find(
      (periodOption) => periodOption.value === preset
    )

    return option?.label ?? "Periodo selecionado"
  }

  return `${formatDateLabel(range.from)} ate ${formatDateLabel(range.to)}`
}

export function buildDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-")

  if (!year || !month || !day) {
    return value
  }

  return `${day}/${month}/${year}`
}
