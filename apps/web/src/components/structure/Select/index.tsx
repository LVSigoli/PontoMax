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
    if (!icon) return "pl-3 pr-10"

    return placement === "end" ? "pl-3 pr-16" : "pl-10 pr-10"
  }

  function renderStartIcon() {
    if (!icon || placement !== "start") return null

    return (
      <Icon
        size="1rem"
        name={icon}
        placement="start"
        className="text-content-muted"
      />
    )
  }

  function renderEndIcon() {
    if (!icon || placement !== "end") return null

    return (
      <Icon
        size="1rem"
        name={icon}
        placement="end"
        positionClassName="right-9"
        className="text-content-muted"
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
