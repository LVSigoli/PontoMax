import { Typography } from "@/components/structure/Typography"

import type { HolidayCalendarCell } from "../../utils"
import { HOLIDAY_TYPE_META, WEEKDAY_LABELS } from "../../utils"

export function MonthCalendarGrid({
  cells,
  monthLabel,
}: {
  cells: HolidayCalendarCell[]
  monthLabel: string
}) {
  return (
    <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <Typography
            variant="h4"
            value={monthLabel}
            className="text-lg font-semibold sm:text-xl"
          />
          <Typography
            variant="legal"
            value="Cada cÃ©lula destaca os feriados ativos do dia."
            className="text-content-muted"
          />
        </div>
        <Typography
          variant="legal"
          value={`${cells.filter((cell) => cell.holidays.length > 0).length} dia(s) com feriado`}
          className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
        />
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[640px] grid-cols-7 gap-1.5 sm:min-w-0 sm:gap-2">
          {WEEKDAY_LABELS.map((weekday) => (
            <div
              key={weekday}
              className="rounded-xl bg-surface-page px-2 py-2 text-center"
            >
              <Typography
                variant="legal"
                value={weekday}
                className="font-semibold text-content-muted"
              />
            </div>
          ))}
          {cells.map((cell) => (
            <CalendarDay key={cell.dateKey} cell={cell} />
          ))}
        </div>
      </div>
    </article>
  )
}

function CalendarDay({ cell }: { cell: HolidayCalendarCell }) {
  return (
    <div
      className={`min-h-20 rounded-2xl border p-2 sm:min-h-28 sm:p-3 ${
        cell.isCurrentMonth
          ? "border-border-subtle bg-surface-page"
          : "border-dashed border-border-subtle bg-surface-muted/30 text-content-muted"
      } ${cell.isToday ? "border-border-focus" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Typography
          variant="b2"
          value={String(cell.date.getDate())}
          className="text-sm font-semibold sm:text-base"
        />
        {cell.isToday ? (
          <span className="rounded-full bg-surface-card px-2 py-0.5 text-[9px] font-semibold">
            Hoje
          </span>
        ) : null}
      </div>
      <div className="grid gap-1">
        {cell.holidays.slice(0, 2).map((holiday) => {
          const meta = HOLIDAY_TYPE_META[holiday.type]
          return (
            <div
              key={holiday.id}
              className={`flex min-w-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${meta.badgeClassName}`}
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${meta.dotClassName}`}
              />
              <span className="min-w-0 truncate">{holiday.name}</span>
            </div>
          )
        })}
        {cell.holidays.length > 2 ? (
          <Typography
            variant="legal"
            value={`+${cell.holidays.length - 2} feriado(s)`}
            className="text-content-muted"
          />
        ) : null}
      </div>
    </div>
  )
}
