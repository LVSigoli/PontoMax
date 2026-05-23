import { Picker } from "@/components/structure/Picker"
import { SearchInput } from "@/components/structure/SearchInput"
import { Select } from "@/components/structure/Select"
import { Skeleton } from "@/components/structure/Skeleton"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

import type { DateRangePreset } from "@/utils/dateRangeFilter"

interface Props {
  companyOptions: SelectionOption[]
  customFrom: string
  customTo: string
  filteredCount: number
  isCompaniesLoading: boolean
  isCustomPeriod: boolean
  isPlatformAdmin: boolean
  periodOptions: SelectionOption[]
  periodSummary: string
  search: string
  selectedCompanyOption: SelectionOption[]
  selectedPeriod: DateRangePreset
  selectedPeriodOption: SelectionOption[]
  selectedStatusOption: SelectionOption[]
  statusOptions: SelectionOption[]
  handleCompanyChange: (selection: SelectionOption[]) => void
  handleCustomFromChange: (value: string) => void
  handleCustomToChange: (value: string) => void
  handlePeriodChange: (selection: SelectionOption[]) => void
  handleSearchChange: (value: string) => void
  handleStatusFilterChange: (selection: SelectionOption[]) => void
}

export const SolicitationsFilters: React.FC<Props> = ({
  companyOptions,
  customFrom,
  customTo,
  filteredCount,
  isCompaniesLoading,
  isCustomPeriod,
  isPlatformAdmin,
  periodOptions,
  periodSummary,
  search,
  selectedCompanyOption,
  selectedPeriod,
  selectedPeriodOption,
  selectedStatusOption,
  statusOptions,
  handleCompanyChange,
  handleCustomFromChange,
  handleCustomToChange,
  handlePeriodChange,
  handleSearchChange,
  handleStatusFilterChange,
}) => {
  return (
    <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <Typography
            variant="b2"
            value="Filtros"
            className="font-semibold"
          />

          <Typography
            variant="legal"
            value="Refine as solicitacoes por periodo, status, empresa e usuario."
            className="text-content-muted"
          />
        </div>

        <Typography
          variant="legal"
          value={`${filteredCount} solicitacao(oes) no periodo ${periodSummary.toLowerCase()}`}
          className="text-content-muted"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          search={handleSearchChange}
          value={search}
          placeHolder="Busque por usuario..."
          className="xl:col-span-2"
          startIcon="search"
        />

        <Select
          label="Status"
          options={statusOptions}
          selectedItem={selectedStatusOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={handleStatusFilterChange}
        />

        <Select
          label="Periodo"
          options={periodOptions}
          selectedItem={selectedPeriodOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={handlePeriodChange}
        />

        {isPlatformAdmin ? (
          isCompaniesLoading && companyOptions.length <= 1 ? (
            <Skeleton className="h-11 w-full rounded-xl" />
          ) : (
            <Select
              label="Empresa"
              options={companyOptions}
              selectedItem={selectedCompanyOption}
              buttonClassName="h-11 bg-surface-card"
              onSelectionChange={handleCompanyChange}
            />
          )
        ) : null}

        {isCustomPeriod && selectedPeriod === "custom" ? (
          <div className="col-span-full grid gap-3 rounded-xl border border-border-subtle bg-surface-muted/35 p-4">
            <Typography
              variant="legal"
              value="Intervalo personalizado"
              className="font-semibold text-content-secondary"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Picker
                type="date"
                label="De"
                value={customFrom}
                onChange={handleCustomFromChange}
              />

              <Picker
                type="date"
                label="Ate"
                value={customTo}
                onChange={handleCustomToChange}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
