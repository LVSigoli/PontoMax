// External Libraries
import React from "react"

// Components
import { Icon } from "../Icon"

// Services
import { MASK } from "@/services/maskModule"

// Types
import { Props } from "./types"

export const Input: React.FC<Props> = ({
  title,
  value,
  icon,
  mask,
  type,
  placeholder,
  iconPlacement = "start",
  onChange,
}) => {
  function getInputpadding() {
    if (!icon) return "pl-2"

    return iconPlacement === "end" ? "pl-2 pr-10" : "pl-10 pr-3"
  }

  // Functions
  function renderStartIcon() {
    if (!icon || iconPlacement !== "start") return null

    return <Icon size="1rem" src={icon} placement="start" />
  }

  function renderEndIcon() {
    if (!icon || iconPlacement !== "end") return null

    return <Icon size="1rem" src={icon} placement="end" />
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    if (!mask) return onChange(value)

    const maskedValue = MASK[mask](value)

    onChange(maskedValue)
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-content-secondary">
        {title}
      </span>

      <span className="relative block">
        {renderStartIcon()}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          className={`h-11 w-full rounded-md border border-border-default bg-surface-card text-sm text-content-primary outline-none transition placeholder:text-content-muted ${getInputpadding()}`}
          onChange={handleInputChange}
        />

        {renderEndIcon()}
      </span>
    </label>
  )
}
