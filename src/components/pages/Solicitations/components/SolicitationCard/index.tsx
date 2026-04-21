// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

// Utils
import { formatSolicitationDate, getSolicitationStatusClass } from "../../utils"

export const SolicitationCard: React.FC<Props> = ({
  solicitation,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="grid min-h-57 cursor-pointer gap-3 rounded-xl bg-surface-card p-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
      onClick={() => onClick(solicitation)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
          >
            ♙
          </span>

          <Typography variant="b1" value={solicitation.userName} />
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSolicitationStatusClass(
            solicitation.status
          )}`}
        >
          {solicitation.status}
        </span>
      </div>

      <div className="grid gap-2">
        <Typography
          variant="b3"
          value={`▣ ${formatSolicitationDate(solicitation.requestDate)}`}
          className="text-content-secondary"
        />

        <Typography
          variant="legal"
          value={`${solicitation.justification.slice(0, 55)} ...`}
          className="text-content-secondary"
        />
      </div>

      <div className="border-t border-border-subtle pt-3">
        <Typography
          variant="b3"
          value={`Solicitado em: ${solicitation.requestedAt}`}
        />
      </div>
    </button>
  )
}
