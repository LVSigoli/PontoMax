import React from "react"

// Types
import { ICON_COMPONENTS, ICON_NAMES } from "./generated"
import { Props } from "./types"

export const Icon: React.FC<Props> = ({
  name,
  size = "1rem",
  layout = "absolute",
  placement = "start",
  positionClassName,
  className = "",
  style,
  onClick,
  ...props
}) => {
  const Component = ICON_COMPONENTS[name]

  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Icon] Unknown icon "${String(name)}". Add it to icon-map.json and regenerate the icons.`
      )
    }

    return null
  }

  const resolvedPositionClass = positionClassName ?? {
    center: "left-1/2 -translate-x-1/2",
    end: "right-3",
    start: "left-3",
  }[placement]
  const layoutClasses =
    layout === "inline"
      ? "block shrink-0"
      : `absolute top-1/2 -translate-y-1/2 ${resolvedPositionClass}`
  const interactionClasses = onClick
    ? "pointer-events-auto cursor-pointer"
    : "pointer-events-none"

  return (
    <Component
      width={16}
      height={16}
      focusable="false"
      aria-hidden={props["aria-label"] ? undefined : true}
      style={{ width: size, height: size, ...style }}
      className={`${layoutClasses} object-contain ${interactionClasses} ${className}`.trim()}
      onClick={onClick}
      {...props}
    />
  )
}

export { ICON_NAMES }
export type { IconName } from "./generated"
