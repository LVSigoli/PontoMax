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
    <div className="flex w-full items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Typography
          variant="h4"
          value={title}
          fontWeight={800}
          className="uppercase tracking-[0.02em]"
        />

        {subtitle ? (
          <Typography
            variant="b1"
            value={subtitle}
            className="mt-1 text-content-secondary"
          />
        ) : null}
      </div>

      <button
        aria-label="Fechar painel lateral"
        type="button"
        className="inline-flex cursor-pointer size-10 shrink-0 items-center justify-center rounded-full text-content-muted transition hover:bg-surface-muted hover:text-content-primary"
        onClick={onClose}
      >
        <Icon name="close" layout="inline" size="1.25rem" />
      </button>
    </div>
  )
}
