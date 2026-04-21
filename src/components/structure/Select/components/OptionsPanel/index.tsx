// External Libraries
import React from "react"
import { createPortal } from "react-dom"

// Components
import { SelectOption } from "./components/SelectOption"

// Types
import type { Props } from "./types"

export const OptionsPanel: React.FC<Props> = ({
  multi,
  options,
  selectedItems,
  optionsPosition,
  optionsRef,
  onOptionClick,
}) => {
  // Constants
  const PANEL_POSITION = {
    top: optionsPosition.top,
    left: optionsPosition.left,
    width: optionsPosition.width,
    maxHeight: optionsPosition.maxHeight,
  }

  return createPortal(
    <div
      ref={optionsRef}
      role="listbox"
      aria-multiselectable={multi}
      className="fixed z-70 overflow-y-auto rounded-lg border border-border-subtle bg-surface-overlay py-1 shadow-[0_14px_40px_rgba(15,23,42,0.14)]"
      style={PANEL_POSITION}
    >
      {options.map((option) => {
        const isSelected = selectedItems.some(
          (item) => item.value === option.value
        )
        return (
          <SelectOption
            key={option.value}
            option={option}
            selected={isSelected}
            onClick={onOptionClick}
          />
        )
      })}
    </div>,
    document.body
  )
}
