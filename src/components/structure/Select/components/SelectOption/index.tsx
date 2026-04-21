import React from "react"

import type { Props } from "./types"

export const SelectOption: React.FC<Props> = ({
  option,
  selected,
  onClick,
}) => {
  function handleOptionClick() {
    onClick(option)
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium transition hover:bg-surface-muted ${
        selected ? "text-brand-700" : "text-content-secondary"
      }`}
      onClick={handleOptionClick}
    >
      <span className="truncate">{option.label}</span>

      {selected ? (
        <span
          aria-hidden="true"
          className="relative size-4 shrink-0 rounded-sm border border-brand-600 bg-brand-600"
        >
          <span className="absolute left-1 top-0.5 h-2 w-1.5 rotate-45 border-b-2 border-r-2 border-content-inverse" />
        </span>
      ) : null}
    </button>
  )
}
