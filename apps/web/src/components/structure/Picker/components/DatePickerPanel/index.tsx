import { useState } from "react"

import { Typography } from "@/components/structure/Typography"

import {
  buildCalendarDays,
  formatDateValue,
  formatMonthLabel,
  getInitialCalendarMonth,
  getWeekdayLabels,
  isSameCalendarDay,
  parseDateValue,
} from "../../utils"

interface Props {
  value: string | Date
  onChange: (value: string) => void
  onClose: () => void
}

export const DatePickerPanel: React.FC<Props> = ({
  value,
  onChange,
  onClose,
}) => {
  const selectedDate = parseDateValue(value)
  const [currentMonth, setCurrentMonth] = useState(() =>
    getInitialCalendarMonth(value)
  )

  const weekdays = getWeekdayLabels()
  const days = buildCalendarDays(currentMonth)

  function handleMonthChange(offset: number) {
    setCurrentMonth((currentValue) => {
      const nextValue = new Date(currentValue)
      nextValue.setMonth(currentValue.getMonth() + offset)

      return nextValue
    })
  }

  function handleSelectDate(date: Date) {
    onChange(formatDateValue(date))
    onClose()
  }

  function handleClear() {
    onChange("")
    onClose()
  }

  return (
    <div className="bg-surface-overlay">
      <header className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          className="text-xl font-semibold text-content-primary transition hover:text-brand-600"
          onClick={() => handleMonthChange(-1)}
        >
          ‹
        </button>

        <Typography
          variant="b1"
          fontWeight={700}
          value={formatMonthLabel(currentMonth)}
        />

        <button
          type="button"
          className="text-xl font-semibold text-content-primary transition hover:text-brand-600"
          onClick={() => handleMonthChange(1)}
        >
          ›
        </button>
      </header>

      <div className="grid grid-cols-7 gap-y-3 px-4 pb-4">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="text-center text-sm font-semibold text-content-secondary"
          >
            {weekday}
          </span>
        ))}

        {days.map((day) => {
          const isSelected = isSameCalendarDay(selectedDate, day.date)

          return (
            <button
              key={day.key}
              type="button"
              className={`mx-auto flex size-9 items-center justify-center rounded-xl text-sm font-medium transition ${
                isSelected
                  ? "bg-brand-500 text-content-inverse"
                  : day.isCurrentMonth
                    ? "text-content-primary hover:bg-surface-page"
                    : "text-content-muted hover:bg-surface-page"
              }`}
              onClick={() => handleSelectDate(day.date)}
            >
              {day.date.getDate()}
            </button>
          )
        })}
      </div>

      <footer className="border-t border-border-default px-4 py-3">
        <button
          type="button"
          className="w-full text-sm font-medium text-content-secondary transition hover:text-brand-600"
          onClick={handleClear}
        >
          Limpar
        </button>
      </footer>
    </div>
  )
}
