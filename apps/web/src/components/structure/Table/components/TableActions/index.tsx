// External Libraries
import { useRef, useState } from "react"

// Types
import type { TableActionsProps, TableRowData } from "../../types"
import { ActionList } from "./ActionList"

export const TableActions = <T extends TableRowData>({
  actions,
  row,
  handleActionClick,
}: TableActionsProps<T>) => {
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null)

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 })

  // Functions
  function handleMenuToggle() {
    setIsOpen((currentValue) => {
      if (!currentValue) setMenuPosition(getMenuPosition())

      return !currentValue
    })
  }

  function handleMenuClose() {
    setIsOpen(false)
  }

  function handleActionSelect(actionId: string) {
    handleActionClick?.(actionId, row)
    handleMenuClose()
  }

  function getMenuPosition() {
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    if (!buttonRect) return { left: 0, top: 0 }

    const estimatedMenuHeight = actions.length * 36 + 8
    const estimatedMenuWidth = 144
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const availableSpaceBelow = viewportHeight - buttonRect.bottom
    const availableSpaceAbove = buttonRect.top
    const shouldOpenUp =
      availableSpaceBelow < estimatedMenuHeight &&
      availableSpaceAbove > availableSpaceBelow

    const top = shouldOpenUp
      ? Math.max(8, buttonRect.top - estimatedMenuHeight - 4)
      : Math.min(buttonRect.bottom + 4, viewportHeight - estimatedMenuHeight - 8)

    const left = Math.min(
      Math.max(8, buttonRect.right - estimatedMenuWidth),
      viewportWidth - estimatedMenuWidth - 8
    )

    return { left, top }
  }

  return (
    <div
      className="relative inline-flex"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Abrir ações"
        className="inline-flex cursor-pointer size-8 items-center justify-center rounded-md text-content-muted transition hover:bg-surface-muted hover:text-content-primary"
        onClick={handleMenuToggle}
      >
        <span className="flex flex-col items-center gap-0.5" aria-hidden="true">
          <span className="size-1 rounded-full bg-current" />
          <span className="size-1 rounded-full bg-current" />
          <span className="size-1 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <ActionList
          actions={actions}
          position={menuPosition}
          onActionClick={handleActionSelect}
        />
      ) : null}
    </div>
  )
}
