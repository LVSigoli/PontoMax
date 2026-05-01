// Components
import { Icon } from "@/components/structure/Icon"

// Types
import type { Props } from "./types"

export const SearchInput: React.FC<Props> = ({
  search,
  value,
  placeHolder = "Buscar...",
  startIcon,
  className = "",
  disabled = false,
}) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return

    search(event.target.value)
  }

  return (
    <label className={`relative block ${className}`}>
      {startIcon ? (
        <Icon
          name={startIcon}
          size="1.25rem"
          className="text-content-muted"
        />
      ) : null}

      <input
        type="search"
        value={value}
        placeholder={placeHolder}
        disabled={disabled}
        className={`h-11 w-full rounded-lg border border-border-default bg-surface-muted text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-border-focus focus:bg-surface-card disabled:cursor-default disabled:caret-transparent disabled:pointer-events-none disabled:text-content-muted ${
          startIcon ? "pl-12 pr-4" : "px-4"
        }`}
        onChange={handleChange}
      />
    </label>
  )
}
