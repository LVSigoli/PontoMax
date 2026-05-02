//  External Libraries
import React from "react"

// Components
import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
}

export const Header: React.FC<Props> = ({ title, subtitle, onClose }) => {
  return (
    <div className="w-full flex flex-col gap-1 justify-center items-start ">
      <div className="w-full flex flex-row gap-2 justify-between items-center">
        <Typography
          variant="h4"
          value={title}
          fontWeight={800}
          className="uppercase tracking-[0.02em]"
        />

        <Icon name="close" layout="inline" onClick={onClose} size="1.25rem" />
      </div>

      {subtitle ? (
        <Typography
          variant="b1"
          value="Solicite o ajuste dos horários necessários"
        />
      ) : null}
    </div>
  )
}
