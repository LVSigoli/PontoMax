// Types
import type { Props, TextSwitchOption } from "./types"

export const TextSwitch = <T extends TextSwitchOption>({
  options,
  value,
  onChange,
}: Props<T>) => {
  return (
    <div className="inline-flex rounded-lg bg-surface-card p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      {options.map((option) => {
        const isActive = option.id === value.id
        const activeClass = isActive
          ? "bg-brand-50 text-brand-700"
          : "text-content-primary hover:bg-surface-muted"

        return (
          <button
            key={option.id}
            type="button"
            className={`inline-flex h-12 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition ${activeClass}`}
            onClick={() => onChange(option)}
          >
            {option.icon ? (
              <span className="flex size-4 items-center justify-center">
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export type { TextSwitchOption } from "./types"
