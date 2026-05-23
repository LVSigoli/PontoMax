import { Select } from "@/components/structure/Select"
import { Skeleton } from "@/components/structure/Skeleton"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

interface Props {
  companyOptions: SelectionOption[]
  isCompaniesLoading: boolean
  isPlatformAdmin: boolean
  resultLabel: string
  selectedCompanyOption: SelectionOption[]
  selectedTypeOption: SelectionOption[]
  selectedYearOption: SelectionOption[]
  typeOptions: SelectionOption[]
  yearOptions: SelectionOption[]
  handleCompanyChange: (selection: SelectionOption[]) => void
  handleTypeChange: (selection: SelectionOption[]) => void
  handleYearChange: (selection: SelectionOption[]) => void
}

export const HolidaysFilters: React.FC<Props> = ({
  companyOptions,
  isCompaniesLoading,
  isPlatformAdmin,
  resultLabel,
  selectedCompanyOption,
  selectedTypeOption,
  selectedYearOption,
  typeOptions,
  yearOptions,
  handleCompanyChange,
  handleTypeChange,
  handleYearChange,
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
            value="Refine a lista por ano, tipo e, quando disponivel, empresa."
            className="text-content-muted"
          />
        </div>

        <Typography
          variant="legal"
          value={resultLabel}
          className="text-content-muted"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Select
          label="Ano"
          options={yearOptions}
          selectedItem={selectedYearOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={handleYearChange}
        />

        <Select
          label="Tipo"
          options={typeOptions}
          selectedItem={selectedTypeOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={handleTypeChange}
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
      </div>
    </section>
  )
}
