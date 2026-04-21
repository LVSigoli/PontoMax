// External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

// Types
import { Props } from "./types"

export const Header: React.FC<Props> = ({
  className = "",
  label,
  subtitle = "",
  titleVariant = "h4",
}) => {
  return (
    <header className={`grid gap-1 ${className}`}>
      <Typography variant={titleVariant} value={label} />

      {subtitle ? <Typography variant="b2" value={subtitle} /> : null}
    </header>
  )
}
