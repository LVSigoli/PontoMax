import { Select } from "@/components/structure/Select"
import { Skeleton } from "@/components/structure/Skeleton"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

import { HOLIDAY_TYPE_META, MONTH_OPTIONS } from "../../utils"

interface CalendarFiltersProps {
  companyOptions: SelectionOption[]
  yearOptions: SelectionOption[]
  selectedCompanyOption: SelectionOption[]
  selectedMonthOption: SelectionOption[]
  selectedYearOption: SelectionOption[]
  selectedCompanyLabel: string
  isPlatformAdmin: boolean
  isCompaniesLoading: boolean
  onCompanyChange: (selection: SelectionOption[]) => void
  onMonthChange: (selection: SelectionOption[]) => void
  onYearChange: (selection: SelectionOption[]) => void
}

export function CalendarFilters({
  companyOptions,
  yearOptions,
  selectedCompanyOption,
  selectedMonthOption,
  selectedYearOption,
  selectedCompanyLabel,
  isPlatformAdmin,
  isCompaniesLoading,
  onCompanyChange,
  onMonthChange,
  onYearChange,
}: CalendarFiltersProps) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <Typography
            variant="b2"
            value="Filtros do calendÃ¡rio"
            className="font-semibold"
          />
          <Typography
            variant="legal"
            value="Empresa, mÃªs e ano definem quais feriados serÃ£o exibidos."
            className="text-content-muted"
          />
        </div>
        <Typography
          variant="legal"
          value={selectedCompanyLabel}
          className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {isPlatformAdmin ? (
          isCompaniesLoading && companyOptions.length === 0 ? (
            <Skeleton className="h-11 w-full rounded-xl" />
          ) : companyOptions.length === 0 ? (
            <CompanyLabel value="Nenhuma empresa disponÃ­vel" />
          ) : (
            <Select
              label="Empresa"
              options={companyOptions}
              selectedItem={selectedCompanyOption}
              buttonClassName="h-11 bg-surface-card"
              onSelectionChange={onCompanyChange}
            />
          )
        ) : (
          <CompanyLabel value={selectedCompanyLabel} />
        )}
        <Select
          label="MÃªs"
          options={MONTH_OPTIONS}
          selectedItem={selectedMonthOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={onMonthChange}
        />
        <Select
          label="Ano"
          options={yearOptions}
          selectedItem={selectedYearOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={onYearChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(HOLIDAY_TYPE_META).map(([type, meta]) => (
          <span
            key={type}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${meta.badgeClassName}`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${meta.dotClassName}`}
            />
            {meta.label}
          </span>
        ))}
      </div>
    </section>
  )
}

function CompanyLabel({ value }: { value: string }) {
  return (
    <div className="grid gap-1 rounded-xl border border-border-default bg-surface-page px-4 py-3">
      <Typography
        variant="legal"
        value="Empresa"
        className="text-content-muted"
      />
      <Typography variant="b2" value={value} />
    </div>
  )
}
