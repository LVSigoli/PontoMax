// External Libraries
import React from "react"

// Types
import { ActionItem } from "./components/ActionItem"
import { Props } from "./types"

export const ActionList: React.FC<Props> = ({
  actions,
  onActionClick,
  position,
}) => {
  return (
    <div
      className="fixed z-[60] min-w-36 overflow-hidden rounded-lg border border-border-subtle bg-surface-overlay py-1 text-left shadow-[0_14px_40px_rgba(15,23,42,0.14)]"
      role="menu"
      style={{ left: position.left, top: position.top }}
    >
      {actions.map((action, index) => (
        <ActionItem
          key={`${action.id}+${index}`}
          action={action}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  )
}
