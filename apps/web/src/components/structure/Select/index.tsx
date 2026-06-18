import React from "react"

// Components
import { Icon } from "@/components/structure/Icon"
import { OptionsPanel } from "./components/OptionsPanel"

// Hooks
import { useSelect } from "./hooks/useSelect"

// Types
import { Props } from "./types"

export const Select: React.FC<Props> = ({
  label,
  multi,
  options,
  icon,
  placement = "start",
  className = "",
  buttonClassName = "",
  valueClassName = "",
  selectedItem,
  onSelectionChange,
}) => {
  // Hooks
  const {
    buttonRef,
    hasSelection,
    isOpen,
    optionsPosition,
    optionsRef,
    selectRef,
    selectedLabel,
    handleOptionClick,
    handleSelectToggle,
  } = useSelect({
    selectedItem,
    options,
    label,
    multi,
    onSelectionChange,
  })
  const selectedIcon = multi ? undefined : selectedItem[0]?.icon
  const startIcon = selectedIcon ?? (placement === "start" ? icon : undefined)
  const endIcon = placement === "end" ? icon : undefined
  const startIconClassName = selectedIcon ? undefined : "text-content-muted"
  const endIconClassName = "text-content-muted"

  function renderOptionsList() {
    if (!isOpen || typeof document === "undefined") return null

    return (
      <OptionsPanel
        multi={multi}
        options={options}
        optionsRef={optionsRef}
        selectedItems={selectedItem}
        optionsPosition={optionsPosition}
        onOptionClick={handleOptionClick}
      />
    )
  }

  function getButtonPadding() {
    if (startIcon && endIcon) return "pl-10 pr-16"
    if (startIcon) return "pl-10 pr-10"
    if (endIcon) return "pl-3 pr-16"

    return "pl-3 pr-10"
  }

  function renderStartIcon() {
    if (!startIcon) return null

    return (
      <Icon
        size="1rem"
        name={startIcon}
        placement="start"
        className={startIconClassName}
      />
    )
  }

  function renderEndIcon() {
    if (!endIcon) return null

    return (
      <Icon
        size="1rem"
        name={endIcon}
        placement="end"
        positionClassName="right-9"
        className={endIconClassName}
      />
    )
  }

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`relative flex h-11 w-full items-center rounded-md border border-border-default bg-surface-card text-left text-sm font-semibold text-content-primary transition focus:border-border-focus ${getButtonPadding()} ${buttonClassName}`}
        onClick={handleSelectToggle}
      >
        {renderStartIcon()}

        <span
          className={`block truncate ${
            hasSelection ? "text-content-primary" : "text-content-muted"
          } ${valueClassName}`}
        >
          {selectedLabel}
        </span>

        {renderEndIcon()}

        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 size-2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-content-muted transition ${
            isOpen ? "mt-1 rotate-225" : "-mt-1"
          }`}
        />
      </button>

      {renderOptionsList()}
    </div>
  )
}
