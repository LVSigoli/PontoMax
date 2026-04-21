// External Libraries
import Image from "next/image"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Components
import { Icon } from "@/components/structure/Icon"
import { SelectOption } from "./components/SelectOption"

// Hooks
import { useSelect } from "./hooks/useSelect"

// Typess
import { Props, SelecttionOption } from "./types"

interface OptionsPosition {
  left: number
  maxHeight: number
  top: number
  width: number
}

const DEFAULT_OPTIONS_POSITION: OptionsPosition = {
  left: 0,
  maxHeight: 240,
  top: 0,
  width: 0,
}

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
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [optionsPosition, setOptionsPosition] = useState<OptionsPosition>(
    DEFAULT_OPTIONS_POSITION
  )

  // Hooks
  const { selected, handleSelectionChange } = useSelect({
    selectedItem,
    options,
    label,
    multi,
    onSelectionChange,
  })

  const hasSelection = selected.length > 0
  const selectedLabel = getSelectedLabel()

  const getOptionsPosition = useCallback((): OptionsPosition => {
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    if (!buttonRect) return DEFAULT_OPTIONS_POSITION

    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const estimatedOptionsHeight = Math.min(options.length * 36 + 8, 240)
    const availableSpaceBelow = viewportHeight - buttonRect.bottom
    const availableSpaceAbove = buttonRect.top
    const shouldOpenUp =
      availableSpaceBelow < estimatedOptionsHeight &&
      availableSpaceAbove > availableSpaceBelow
    const availableSpace = shouldOpenUp
      ? availableSpaceAbove
      : availableSpaceBelow
    const maxHeight = Math.max(96, Math.min(240, availableSpace - 12))
    const renderedHeight = Math.min(estimatedOptionsHeight, maxHeight)
    const top = shouldOpenUp
      ? Math.max(8, buttonRect.top - renderedHeight - 4)
      : Math.min(buttonRect.bottom + 4, viewportHeight - renderedHeight - 8)
    const width = buttonRect.width
    const left = Math.min(
      Math.max(8, buttonRect.left),
      viewportWidth - width - 8
    )

    return {
      left,
      maxHeight,
      top,
      width,
    }
  }, [options.length])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      const clickedSelect = selectRef.current?.contains(target)
      const clickedOptions = optionsRef.current?.contains(target)

      if (!clickedSelect && !clickedOptions) setIsOpen(false)
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handleViewportChange() {
      setOptionsPosition(getOptionsPosition())
    }

    handleViewportChange()

    window.addEventListener("resize", handleViewportChange)
    window.addEventListener("scroll", handleViewportChange, true)

    return () => {
      window.removeEventListener("resize", handleViewportChange)
      window.removeEventListener("scroll", handleViewportChange, true)
    }
  }, [getOptionsPosition, isOpen])

  // Functions
  function getButtonPadding() {
    if (!icon) return "pl-3 pr-10"

    return placement === "end" ? "pl-3 pr-16" : "pl-10 pr-10"
  }

  function getSelectedLabel() {
    if (!selected.length) return label ?? "Selecione"

    if (multi) return selected.map((item) => item.label).join(", ")

    return selected[0].label
  }

  function handleSelectToggle() {
    setIsOpen((currentValue) => {
      if (!currentValue) setOptionsPosition(getOptionsPosition())

      return !currentValue
    })
  }

  function handleOptionClick(option: SelecttionOption) {
    handleSelectionChange(option.value)

    if (!multi) setIsOpen(false)
  }

  function isOptionSelected(option: SelecttionOption) {
    return selected.some((item) => item.value === option.value)
  }

  function renderOptionsList() {
    if (!isOpen || typeof document === "undefined") return null

    return createPortal(
      <div
        ref={optionsRef}
        role="listbox"
        aria-multiselectable={multi}
        className="fixed z-70 overflow-y-auto rounded-lg border border-border-subtle bg-surface-overlay py-1 shadow-[0_14px_40px_rgba(15,23,42,0.14)]"
        style={{
          left: optionsPosition.left,
          maxHeight: optionsPosition.maxHeight,
          top: optionsPosition.top,
          width: optionsPosition.width,
        }}
      >
        {options.map((option) => (
          <SelectOption
            key={option.value}
            option={option}
            selected={isOptionSelected(option)}
            onClick={handleOptionClick}
          />
        ))}
      </div>,
      document.body
    )
  }

  function renderStartIcon() {
    if (!icon || placement !== "start") return null

    return <Icon size="1rem" src={icon} placement="start" />
  }

  function renderEndIcon() {
    if (!icon || placement !== "end") return null

    return (
      <Image
        src={icon}
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute right-9 top-1/2 size-4 -translate-y-1/2 object-contain text-content-muted"
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
        className={`relative flex h-11 w-full items-center rounded-md border bg-surface-card text-left text-sm font-semibold text-content-primary transition border-border-strongs ${getButtonPadding()} ${buttonClassName}`}
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
