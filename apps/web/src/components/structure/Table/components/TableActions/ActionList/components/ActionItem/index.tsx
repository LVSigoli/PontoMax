// External Libraries
import type { StaticImageData } from "next/image"
import Image from "next/image"
import React from "react"

// Types
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
  if (isImageSource(icon)) {
    return (
      <Image
        src={icon}
        alt=""
        width={16}
        height={16}
        className="block size-4 object-contain"
      />
    )
  }

  return icon
}

function isImageSource(
  icon: Props["action"]["icon"]
): icon is string | StaticImageData {
  return (
    typeof icon === "string" ||
    (typeof icon === "object" && icon !== null && "src" in icon)
  )
}
