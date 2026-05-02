import { Typography } from "@/components/structure/Typography"

import type { PickerPeriod } from "../../types"

interface Props {
  label?: string
  hour: string
  minute: string
  period?: PickerPeriod
  showPeriod?: boolean
  onHourBlur: () => void
  onHourChange: (value: string) => void
  onMinuteBlur: () => void
  onMinuteChange: (value: string) => void
  onPeriodChange?: (period: PickerPeriod) => void
}

export const TimeFields: React.FC<Props> = ({
  label,
  hour,
  minute,
  period = "AM",
  showPeriod = false,
  onHourBlur,
  onHourChange,
  onMinuteBlur,
  onMinuteChange,
  onPeriodChange,
}) => {
  function renderPeriodButton(nextPeriod: PickerPeriod) {
    const isActive = period === nextPeriod

    return (
      <button
        type="button"
        className={`flex h-8 items-center justify-center rounded-md px-3 text-sm font-semibold transition ${
          isActive
            ? "bg-brand-100 text-brand-700"
            : "text-content-secondary hover:bg-surface-page"
        }`}
        onClick={() => onPeriodChange?.(nextPeriod)}
      >
        {nextPeriod}
      </button>
    )
  }

  function renderInput(
    value: string,
    onChange: (value: string) => void,
    onBlur: () => void
  ) {
    return (
      <input
        value={value}
        inputMode="numeric"
        maxLength={2}
        className="h-14 w-12 rounded-md border border-border-default bg-surface-card text-center text-[1.75rem] font-semibold text-content-primary outline-none transition focus:border-border-focus"
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  return (
    <div className="grid gap-2 w-full items-center justify-center">
      {label ? <Typography variant="b2" value={label} /> : null}

      <div className="flex items-start gap-3">
        <div className="flex items-center gap-3">
          {renderInput(hour, onHourChange, onHourBlur)}

          <span className="pt-1 text-[2rem] font-semibold leading-none text-content-secondary">
            :
          </span>

          {renderInput(minute, onMinuteChange, onMinuteBlur)}
        </div>
      </div>
    </div>
  )
}
