// External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

// Types
import { Props } from "./types"

export const Header: React.FC<Props> = ({
  label,
  subtitle = "",
  titleVariant = "h3",
}) => {
  return (
    <header className="border-b border-border-subtle bg-surface-card px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
        <Typography variant={titleVariant} value={label} />

        <Typography variant="b2" value={subtitle} />
      </div>
    </header>
  )
}
