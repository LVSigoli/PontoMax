// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

// Utils
import { getAnalysisTypeStyle } from "../../utils"

export const AnalysisCard: React.FC<Props> = ({ item }) => {
  const typeStyle = getAnalysisTypeStyle(item.type)

  return (
    <article className="grid min-h-34 content-between rounded-xl bg-surface-card px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${typeStyle.iconClassName}`}
        >
          {typeStyle.icon}
        </span>

        <Typography variant="b1" value={item.label} />
      </div>

      <div className="grid gap-1 pl-16">
        <Typography
          variant="h4"
          value={item.data}
          className="text-center sm:text-left"
        />

        <Typography
          variant="legal"
          value={item.subtitle}
          className="max-w-55 text-content-muted"
        />
      </div>
    </article>
  )
}
