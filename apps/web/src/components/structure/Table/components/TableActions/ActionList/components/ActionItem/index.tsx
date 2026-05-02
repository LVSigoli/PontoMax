import React from "react"

// Types
import { Icon } from "@/components/structure/Icon"
import { Props } from "./types"

export const ActionItem: React.FC<Props> = ({ action, onActionClick }) => {
  const icon = action.icon

  // Functions
  function handleActionClick() {
    onActionClick(action.id)
  }

  return (
    <button
      key={action.id}
      className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium leading-none transition hover:bg-surface-muted ${
        action.color ?? "text-content-secondary"
      }`}
      role="menuitem"
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleActionClick}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {renderActionIcon(icon)}
      </span>
      <span className="flex h-4 items-center leading-none">{action.label}</span>
    </button>
  )
}

function renderActionIcon(icon: Props["action"]["icon"]) {
  if (typeof icon === "string") {
    return <Icon name={icon} layout="inline" size="1rem" />
  }

  return icon
}
