import type { SelectionOption } from "@/components/structure/Select/types"
import type { Holiday } from "../Holidays/types"

export const MONTH_OPTIONS: SelectionOption[] = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
]

export const WEEKDAY_LABELS = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
] as const

export const HOLIDAY_TYPE_META = {
  Nacional: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
    label: "Nacional",
  },
  Estadual: {
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    dotClassName: "bg-sky-500",
    label: "Estadual",
  },
  Municipal: {
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-700",
    dotClassName: "bg-cyan-500",
    label: "Municipal",
  },
  Empresa: {
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
    label: "Empresa",
  },
} as const satisfies Record<
  Holiday["type"],
  {
    badgeClassName: string
    dotClassName: string
    label: string
  }
>

const HOLIDAY_TYPE_ORDER: Record<Holiday["type"], number> = {
  Nacional: 0,
  Empresa: 1,
  Estadual: 2,
  Municipal: 3,
}

export interface HolidayCalendarCell {
  date: Date
  dateKey: string
  holidays: Holiday[]
  isCurrentMonth: boolean
  isToday: boolean
}

export function buildMonthGrid(
  year: number,
  month: number,
  holidays: Holiday[]
) {
  const groupedHolidays = groupHolidaysByDate(holidays)
  const firstDayOfMonth = new Date(year, month, 1)
  const weekStartOffset = (firstDayOfMonth.getDay() + 6) % 7
  const gridStartDate = new Date(year, month, 1 - weekStartOffset)
  const today = new Date()

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStartDate)
    date.setDate(gridStartDate.getDate() + index)

    const dateKey = formatDateKey(date)

    return {
      date,
      dateKey,
      holidays: groupedHolidays.get(dateKey) ?? [],
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameCalendarDay(date, today),
    } satisfies HolidayCalendarCell
  })
}

export function formatMonthLabel(year: number, month: number) {
  const rawLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(new Date(year, month, 1))

  return rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)
}

function groupHolidaysByDate(holidays: Holiday[]) {
  const grouped = new Map<string, Holiday[]>()

  for (const holiday of [...holidays].sort((left, right) => {
    const leftDateDiff = left.date.localeCompare(right.date)

    if (leftDateDiff !== 0) {
      return leftDateDiff
    }

    const leftTypeDiff =
      HOLIDAY_TYPE_ORDER[left.type] - HOLIDAY_TYPE_ORDER[right.type]

    if (leftTypeDiff !== 0) {
      return leftTypeDiff
    }

    return left.name.localeCompare(right.name)
  })) {
    const currentItems = grouped.get(holiday.date) ?? []

    grouped.set(holiday.date, [...currentItems, holiday])
  }

  return grouped
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}
