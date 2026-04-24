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
}) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    search(event.target.value)
  }

  return (
    <label className={`relative block ${className}`}>
      {startIcon ? <Icon src={startIcon} size="1.25rem" /> : null}

      <input
        type="search"
        value={value}
        placeholder={placeHolder}
        className={`h-11 w-full rounded-lg border border-border-default bg-surface-muted text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-border-focus focus:bg-surface-card ${
          startIcon ? "pl-12 pr-4" : "px-4"
        }`}
        onChange={handleChange}
      />
    </label>
  )
}
