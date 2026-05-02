import { useEffect, useRef, useState } from "react"

import type { PickerPanelPosition } from "../../types"
import { getPickerPanelDimensions } from "../../utils"
import type { UsePickerParams } from "./types"

const DEFAULT_PANEL_POSITION: PickerPanelPosition = {
  left: 0,
  top: 0,
  width: 0,
}

export function usePicker({ disabled, type }: UsePickerParams) {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [panelPosition, setPanelPosition] = useState<PickerPanelPosition>(
    DEFAULT_PANEL_POSITION
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      const clickedTrigger = triggerRef.current?.contains(target)
      const clickedPanel = panelRef.current?.contains(target)

      if (!clickedTrigger && !clickedPanel) closePicker()
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") closePicker()
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

    function updatePanelPosition() {
      const buttonRect = triggerRef.current?.getBoundingClientRect()
      if (!buttonRect) return

      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const dimensions = getPickerPanelDimensions(type)
      const shouldOpenUp =
        viewportHeight - buttonRect.bottom < dimensions.height &&
        buttonRect.top > viewportHeight - buttonRect.bottom
      const left = Math.min(
        Math.max(8, buttonRect.left),
        viewportWidth - dimensions.width - 8
      )
      const top = shouldOpenUp
        ? Math.max(8, buttonRect.top - dimensions.height - 4)
        : Math.min(buttonRect.bottom + 4, viewportHeight - dimensions.height - 8)

      setPanelPosition({
        left,
        top,
        width: dimensions.width,
      })
    }

    updatePanelPosition()

    window.addEventListener("resize", updatePanelPosition)
    window.addEventListener("scroll", updatePanelPosition, true)

    return () => {
      window.removeEventListener("resize", updatePanelPosition)
      window.removeEventListener("scroll", updatePanelPosition, true)
    }
  }, [isOpen, type])

  function closePicker() {
    setIsOpen(false)
  }

  function handleToggle() {
    if (disabled) return

    setIsOpen((currentValue) => !currentValue)
  }

  return {
    containerRef,
    triggerRef,
    panelRef,
    isOpen,
    panelPosition,
    closePicker,
    handleToggle,
  }
}
