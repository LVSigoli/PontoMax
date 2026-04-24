// External Libraries
import { useCallback, useEffect, useRef, useState } from "react"

// Types
import type { OptionsPosition, SelecttionOption } from "../../types"
import type { UseSelectParams } from "./types"

const DEFAULT_OPTIONS_POSITION: OptionsPosition = {
  left: 0,
  maxHeight: 240,
  top: 0,
  width: 0,
}

export function useSelect({
  label,
  selectedItem,
  options,
  multi,
  onSelectionChange,
}: UseSelectParams) {
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [optionsPosition, setOptionsPosition] = useState<OptionsPosition>(
    DEFAULT_OPTIONS_POSITION
  )

  // Constants
  const selected = selectedItem
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

  // Effescts
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      const clickedSelect = selectRef.current?.contains(target)
      const clickedOptions = optionsRef.current?.contains(target)

      if (!clickedSelect && !clickedOptions) closeOptions()
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeOptions()
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
  function closeOptions() {
    setIsOpen(false)
  }

  function getSelectedLabel() {
    if (!selected.length) return label ?? "Selecione"

    if (multi) return selected.map((item) => item.label).join(", ")

    return selected[0].label
  }

  function handleSelectionChange(id: string) {
    if (!id) return []

    const currentSelection = options.find((option) => option.value === id)

    if (!currentSelection) return

    if (multi) {
      const isSelected = selectedItem.some((item) => item.value === id)
      const updatedSelection = isSelected
        ? selectedItem.filter((item) => item.value !== id)
        : [...selectedItem, currentSelection]

      onSelectionChange(updatedSelection)
      return updatedSelection
    }

    onSelectionChange([currentSelection])
    return [currentSelection]
  }

  function handleOptionClick(option: SelecttionOption) {
    handleSelectionChange(option.value)

    if (!multi) closeOptions()
  }

  function handleSelectToggle() {
    setIsOpen((currentValue) => {
      if (!currentValue) setOptionsPosition(getOptionsPosition())

      return !currentValue
    })
  }

  return {
    buttonRef,
    hasSelection,
    isOpen,
    optionsPosition,
    optionsRef,
    selectRef,
    selected,
    selectedLabel,
    closeOptions,
    handleOptionClick,
    handleSelectToggle,
  }
}
