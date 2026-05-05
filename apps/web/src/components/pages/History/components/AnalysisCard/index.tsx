// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

// Utils
import { Icon } from "@/components/structure/Icon"
import { getAnalysisTypeStyle } from "./utils"

export const AnalysisCard: React.FC<Props> = ({ item }) => {
  const typeStyle = getAnalysisTypeStyle(item.type)

  return (
    <article className="grid min-h-34 content-between rounded-xl bg-surface-card px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${typeStyle.iconClassName}`}
        >
          <Icon name={typeStyle.icon} layout="inline" />
        </span>

        <Typography variant="b1" value={item.label} />
      </div>

      <div className="flex flex-row items-center gap-1">
        <Typography
          variant="h4"
          value={item.data}
          className="text-center w-full sm:tex-left sm:pl-8 sm:pr-8"
        />
      </div>

      <Typography
        variant="legal"
        value={item.subtitle}
        className="text-content-muted"
      />
    </article>
  )
}
