// External Libraries
import React from "react"

// Constants
import { BUTTON_BASE_CLASS, BUTTON_VARIANTS } from "./constants"

// Components
import { Icon } from "@/components/structure/Icon"

// Types
import type { Props } from "./types"

export const Button: React.FC<Props> = ({
  value,
  disabled,
  className = "",
  color = "brand",
  fitWidth = false,
  icon,
  iconPlacement = "start",
  loading = false,
  type = "button",
  variant = "filled",
  onClick,
  ...props
}) => {
  const widthClass = fitWidth ? "w-full" : "w-fit"
  const isDisabled = disabled || loading
  const normalizedIconPlacement =
    iconPlacement === "right" || iconPlacement === "end" ? "end" : "start"
  const paddingClass = getButtonPadding()

  // Functions
  function getButtonPadding() {
    if (!icon) return ""

    return normalizedIconPlacement === "end" ? "pl-3 pr-10" : "pl-10 pr-3"
  }

  function renderStartIcon() {
    if (!icon || normalizedIconPlacement !== "start" || loading) return null

    return <Icon size="1rem" name={icon} placement="start" />
  }

  function renderEndIcon() {
    if (!icon || normalizedIconPlacement !== "end" || loading) return null

    return <Icon size="1rem" name={icon} placement="end" />
  }

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${BUTTON_BASE_CLASS} relative ${BUTTON_VARIANTS[color][variant]} ${widthClass} ${paddingClass} ${className}`}
    >
      {renderStartIcon()}

      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        value
      )}

      {renderEndIcon()}
    </button>
  )
}

export type { ButtonColor, ButtonIconPlacement, ButtonVariant } from "./types"
