// External Libraries
import { useState } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Typography } from "@/components/structure/Typography"
import { TimeFields } from "../TimeFields"

// Utils
import {
  buildCalendarDays,
  buildDateTimeFromParts,
  buildTimeValue,
  clampInputValue,
  formatDateValue,
  formatMonthLabel,
  getInitialCalendarMonth,
  getWeekdayLabels,
  isSameCalendarDay,
  normalizeDigitInput,
  parseDateValue,
  parseTimeDraft,
} from "../../utils"

// Types
import type { TimeDraft } from "../../types"

interface Props {
  value: string | Date
  onChange: (value: string) => void
  onClose: () => void
}

export const DateTimePickerPanel: React.FC<Props> = ({
  value,
  onChange,
  onClose,
}) => {
  const initialDate = parseDateValue(value)
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [currentMonth, setCurrentMonth] = useState(() =>
    getInitialCalendarMonth(value)
  )
  const [draft, setDraft] = useState<TimeDraft>(() => parseTimeDraft(value))

  const weekdays = getWeekdayLabels()
  const days = buildCalendarDays(currentMonth)

  function syncValue(nextDate: Date | null, nextDraft: TimeDraft) {
    if (!nextDate) {
      onChange("")
      return
    }

    const timeValue = buildTimeValue(nextDraft)
    if (!timeValue) {
      onChange(formatDateValue(nextDate))
      return
    }

    onChange(buildDateTimeFromParts(formatDateValue(nextDate), timeValue))
  }

  function handleMonthChange(offset: number) {
    setCurrentMonth((currentValue) => {
      const nextValue = new Date(currentValue)
      nextValue.setMonth(currentValue.getMonth() + offset)

      return nextValue
    })
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
  }

  function handleHourChange(value: string) {
    const nextDraft = {
      ...draft,
      hour: normalizeDigitInput(value),
    }

    setDraft(nextDraft)
  }

  function handleMinuteChange(value: string) {
    const nextDraft = {
      ...draft,
      minute: normalizeDigitInput(value),
    }

    setDraft(nextDraft)
  }

  function handleHourBlur() {
    const nextDraft = {
      ...draft,
      hour: clampInputValue(draft.hour, 0, 23),
    }

    setDraft(nextDraft)
  }

  function handleMinuteBlur() {
    const nextDraft = {
      ...draft,
      minute: clampInputValue(draft.minute, 0, 59),
    }

    setDraft(nextDraft)
  }

  function handleClear() {
    setSelectedDate(null)
    setDraft({
      hour: "00",
      minute: "00",
    })
    onChange("")
    onClose()
  }

  function handleConfirm() {
    const sanitizedDraft = {
      hour: clampInputValue(draft.hour, 0, 23),
      minute: clampInputValue(draft.minute, 0, 59),
    }

    setDraft(sanitizedDraft)
    syncValue(selectedDate, sanitizedDraft)
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

      <div className="border-t border-border-default px-4 py-4">
        <TimeFields
          label="Hora"
          hour={draft.hour}
          minute={draft.minute}
          onHourBlur={handleHourBlur}
          onHourChange={handleHourChange}
          onMinuteBlur={handleMinuteBlur}
          onMinuteChange={handleMinuteChange}
        />
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border-default px-4 py-3">
        <Button
          variant="text"
          value="Limpar"
          className="text-content-secondary"
          onClick={handleClear}
        />

        <Button variant="text" value="Confirmar" onClick={handleConfirm} />
      </footer>
    </div>
  )
}
