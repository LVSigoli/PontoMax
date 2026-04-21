// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

// Utils
import { getMetricTypeStyle } from "../../utils"

export const MetricCard: React.FC<Props> = ({ metric }) => {
  const typeStyle = getMetricTypeStyle(metric.type)

  return (
    <article className="grid min-h-38 content-between rounded-xl bg-surface-card px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${typeStyle.iconClassName}`}
        >
          {typeStyle.icon}
        </span>

        <Typography variant="b1" value={metric.label} className="max-w-44" />
      </div>

      <div className="grid gap-1 pl-16">
        <Typography variant="h4" value={metric.data} />

        <Typography
          variant="legal"
          value={metric.subtitle}
          className="max-w-56 text-content-muted"
        />
      </div>
    </article>
  )
}
