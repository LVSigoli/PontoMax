import { Typography } from "@/components/structure/Typography"

interface Props {
  label?: string
  hour: string
  minute: string
  onHourBlur: () => void
  onHourChange: (value: string) => void
  onMinuteBlur: () => void
  onMinuteChange: (value: string) => void
}

export const TimeFields: React.FC<Props> = ({
  label,
  hour,
  minute,
  onHourBlur,
  onHourChange,
  onMinuteBlur,
  onMinuteChange,
}) => {
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
        onClick={(event) => event.currentTarget.select()}
        onFocus={(event) => event.currentTarget.select()}
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
