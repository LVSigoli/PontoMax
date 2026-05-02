import { forwardRef } from "react"

import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

import type { PickerFieldProps } from "../../types"

export const PickerField = forwardRef<HTMLButtonElement, PickerFieldProps>(
  (
    {
      disabled = false,
      iconName,
      isOpen,
      label,
      placeholder,
      value,
      variant,
      className = "",
      onClick,
    },
    ref
  ) => {
    const hasValue = Boolean(value)

    function getFieldClassName() {
      if (variant === "table") {
        return "h-9 border-transparent bg-transparent px-2 pr-9 text-sm font-semibold focus:border-border-focus focus:bg-surface-page"
      }

      return "h-11 border-border-default bg-surface-card px-3 pr-10 text-sm focus:border-border-focus"
    }

    return (
      <div className="grid gap-1">
        {label ? <Typography variant="b2" value={label} /> : null}

        <button
          ref={ref}
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={`relative flex w-full items-center rounded-md border text-left text-content-primary outline-none transition disabled:cursor-default disabled:opacity-60 ${getFieldClassName()} ${className}`}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
        >
          <span
            className={`block truncate ${
              hasValue ? "text-content-primary" : "text-content-muted"
            }`}
          >
            {hasValue ? value : placeholder}
          </span>

          <Icon
            size="1rem"
            name={iconName}
            placement="end"
            className={isOpen ? "text-brand-600" : "text-content-muted"}
          />
        </button>
      </div>
    )
  }
)

PickerField.displayName = "PickerField"
