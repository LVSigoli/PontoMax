// External Libraries
import React from "react"

// Components
import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

interface Props {
  className?: string
  showBorder?: boolean
}

export const SidebarHeader: React.FC<Props> = ({
  className = "",
  showBorder = true,
}) => {
  const containerClassName = [
    showBorder ? "border-b border-border-subtle" : "",
    "px-6 py-6",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={containerClassName}>
      <div className="flex items-center gap-3">
        <span className=" relative  size-8  rounded-lg bg-brand-600 text-content-inverse text-sm font-bold">
          <Icon name="clock" placement="center" />
        </span>

        <div className="flex flex-col gap-2 align-center">
          <Typography
            variant="b2"
            fontWeight={700}
            lineHeight="50%"
            value="PontoMax"
          />
          <Typography variant="legal" value="Gestão de Ponto" />
        </div>
      </div>
    </div>
  )
}
