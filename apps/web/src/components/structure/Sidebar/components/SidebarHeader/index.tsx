// External Libraries
import React from "react"

// Components
import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"

export const SidebarHeader: React.FC = () => {
  return (
    <div className="border-b border-border-subtle px-6 py-6">
      <div className="flex items-center gap-3">
        <span className=" relative  size-8  rounded-lg bg-brand-600 text-sm font-bold">
          <Icon src={ClockIcon} placement="center" />
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
