// External Libraries
import React from "react"

// Constants
import { BUTTON_BASE_CLASS, BUTTON_VARIANTS } from "./constants"

// Types
import type { Props } from "./types"

export const Button: React.FC<Props> = ({
  value,
  disabled,
  className = "",
  color = "brand",
  fitWidth = false,
  loading = false,
  type = "button",
  variant = "filled",
  onClick,
  ...props
}) => {
  const widthClass = fitWidth ? "w-full" : "w-fit"
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${BUTTON_BASE_CLASS} ${BUTTON_VARIANTS[color][variant]} ${widthClass} ${className}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        value
      )}
    </button>
  )
}

export type { ButtonColor, ButtonVariant } from "./types"
