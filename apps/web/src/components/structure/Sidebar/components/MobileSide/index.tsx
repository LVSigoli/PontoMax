import { useEffect, useRef } from "react"

import { MobileSidebarBottomBar } from "./components/MobileSidebarBottomBar"
import { MobileSidebarPanel } from "./components/MobileSidebarPanel"
import type { MobileSidebarProps } from "./types"

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  items,
  primaryItems,
  onClose,
  onOpen,
  isItemActive,
}) => {
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      <MobileSidebarBottomBar
        isOpen={isOpen}
        items={primaryItems}
        onOpen={onOpen}
        isItemActive={isItemActive}
      />

      <MobileSidebarPanel
        isOpen={isOpen}
        items={items}
        onClose={onClose}
        isItemActive={isItemActive}
        panelRef={panelRef}
      />
    </>
  )
}
