import { Typography } from "@/components/structure/Typography"

import type { Holiday } from "../../../Holidays/types"
import { formatHolidayCompanies, formatHolidayDate } from "../../../Holidays/utils"
import { HOLIDAY_TYPE_META } from "../../utils"
import { CalendarEmptyState } from "../CalendarEmptyState"

export function MonthHolidayList({ holidays }: { holidays: Holiday[] }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid gap-1">
          <Typography
            variant="h4"
            value="Feriados do mÃªs"
            className="text-xl font-semibold"
          />
          <Typography
            variant="legal"
            value="Lista resumida com data, tipo e escopo."
            className="text-content-muted"
          />
        </div>
        <Typography
          variant="legal"
          value={`${holidays.length} encontrado(s)`}
          className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
        />
      </div>

      {holidays.length === 0 ? (
        <CalendarEmptyState />
      ) : (
        <div className="grid gap-3">
          {holidays.map((holiday) => {
            const meta = HOLIDAY_TYPE_META[holiday.type]
            return (
              <article
                key={holiday.id}
                className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-page p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <Typography
                      variant="b2"
                      value={holiday.name}
                      className="font-semibold"
                    />
                    <Typography
                      variant="legal"
                      value={formatHolidayDate(holiday.date)}
                      className="text-content-muted"
                    />
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${meta.badgeClassName}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <Typography
                  variant="legal"
                  value={formatHolidayCompanies(holiday)}
                  className="text-content-muted"
                />
              </article>
            )
          })}
        </div>
      )}
    </article>
  )
}
