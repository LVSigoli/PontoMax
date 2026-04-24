// External Libraries
import React from "react"

// Constants
import { TYPOGRAPHY_COLORS, TYPOGRAPHY_VARIANTS } from "./constants"

// Types
import type { Props } from "./types"

// Utils
import { getTypographyStyle } from "./utils"

export const Typography: React.FC<Props> = ({
  as,
  value,
  className = "",
  color,
  fontSize,
  fontWeight,
  lineHeight,
  variant = "b1",
}) => {
  const variantConfig = TYPOGRAPHY_VARIANTS[variant]
  const Component = as ?? variantConfig.element
  const colorClass = TYPOGRAPHY_COLORS[color ?? variantConfig.color]
  const style = getTypographyStyle({ fontSize, fontWeight, lineHeight })

  return (
    <Component
      className={`${variantConfig.className} ${colorClass} ${className}`}
      style={style}
    >
      {value}
    </Component>
  )
}

export type { TypographyColor, TypographyVariant } from "./types"
