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
  variant = "default",
  iconPlacement = "start",
  className = "",
  fieldClassName = "",
  onChange,
  onIconClick,
}) => {
  function getInputpadding() {
    if (!icon) return "pl-2"

    return iconPlacement === "end" ? "pl-2 pr-10" : "pl-10 pr-3"
  }

  function getFieldClassName() {
    if (variant === "table") {
      return "h-9 border-transparent bg-transparent font-semibold focus:border-border-focus focus:bg-surface-page disabled:bg-transparent disabled:opacity-60"
    }

    return "h-11 border-border-default bg-surface-card disabled:bg-surface-muted"
  }

  // Functions
  function renderStartIcon() {
    if (!icon || iconPlacement !== "start") return null

    return (
      <Icon
        size="1rem"
        name={icon}
        placement="start"
        className="text-content-muted"
        onClick={onIconClick}
      />
    )
  }

  function renderEndIcon() {
    if (!icon || iconPlacement !== "end") return null

    return (
      <Icon
        size="1rem"
        name={icon}
        placement="end"
        className="text-content-muted"
        onClick={onIconClick}
      />
    )
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return

    const value = event.target.value
    if (!mask) return onChange(value)

    const maskedValue = MASK[mask](value)

    onChange(maskedValue)
  }

  return (
    <label className={`block ${className}`}>
      {title ? <Typography variant="b2" value={title} /> : null}

      <span className="relative block">
        {renderStartIcon()}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-md text-sm text-content-primary outline-none transition placeholder:text-content-muted disabled:cursor-default disabled:caret-transparent disabled:pointer-events-none disabled:text-content-muted ${getInputpadding()} ${getFieldClassName()} ${fieldClassName}`}
          onChange={handleInputChange}
        />

        {renderEndIcon()}
      </span>
    </label>
  )
}
