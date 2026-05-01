// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

// Utils
import { formatPickerValue, getPickerInputType } from "./utils"

export const Picker: React.FC<Props> = ({
  type,
  value,
  label,
  placeholder,
  className = "",
  disabled = false,
  onChange,
}) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return

    onChange(event.target.value)
  }

  return (
    <label className={`block ${className}`}>
      {label ? <Typography variant="b2" value={label} /> : null}

      <span className="relative block">
        <input
          type={getPickerInputType(type)}
          value={formatPickerValue(value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 w-full rounded-md border border-border-default bg-surface-card px-3 pr-10 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-border-focus disabled:cursor-default disabled:caret-transparent disabled:pointer-events-none disabled:bg-surface-muted disabled:text-content-muted"
          onChange={handleChange}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-content-primary text-xs text-content-primary"
        >
          {type === "date" || type === "dateTime" ? "□" : ""}
        </span>
      </span>
    </label>
  )
}

export type { PickerType } from "./types"
