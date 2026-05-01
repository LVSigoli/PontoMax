// External Libraries
import React from "react"

// Components
import { Icon } from "@/components/structure/Icon"

// Services
import { MASK } from "@/services/maskModule"

// Types
import { Typography } from "../Typography"
import { Props } from "./types"

export const Input: React.FC<Props> = ({
  title,
  value,
  icon,
  mask,
  type,
  placeholder,
  disabled = false,
  iconPlacement = "start",
  onChange,
  onIconClick,
}) => {
  function getInputpadding() {
    if (!icon) return "pl-2"

    return iconPlacement === "end" ? "pl-2 pr-10" : "pl-10 pr-3"
  }

  // Functions
  function renderStartIcon() {
    if (!icon || iconPlacement !== "start") return null

    return (
      <Icon size="1rem" src={icon} placement="start" onClick={onIconClick} />
    )
  }

  function renderEndIcon() {
    if (!icon || iconPlacement !== "end") return null

    return <Icon size="1rem" src={icon} placement="end" onClick={onIconClick} />
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return

    const value = event.target.value
    if (!mask) return onChange(value)

    const maskedValue = MASK[mask](value)

    onChange(maskedValue)
  }

  return (
    <label className="block">
      <Typography variant="b2" value={title} />

      <span className="relative block">
        {renderStartIcon()}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-11 w-full rounded-md border border-border-default bg-surface-card text-sm text-content-primary outline-none transition placeholder:text-content-muted disabled:cursor-default disabled:caret-transparent disabled:pointer-events-none disabled:bg-surface-muted disabled:text-content-muted ${getInputpadding()}`}
          onChange={handleInputChange}
        />

        {renderEndIcon()}
      </span>
    </label>
  )
}
