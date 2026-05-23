import { Picker } from "@/components/structure/Picker"
import { Select } from "@/components/structure/Select"
import { Skeleton } from "@/components/structure/Skeleton"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

interface Props {
  canFilterHistory: boolean
  companyOptions: SelectionOption[]
  customFrom: string
  customTo: string
  handleCompanyChange: (selection: SelectionOption[]) => void
  handleCustomFromChange: (value: string) => void
  handleCustomToChange: (value: string) => void
  handleHistoryUserChange: (selection: SelectionOption[]) => void
  handlePeriodChange: (selection: SelectionOption[]) => void
  historyUserOptions: SelectionOption[]
  isCompaniesLoading: boolean
  isCustomPeriod: boolean
  isPlatformAdmin: boolean
  isUsersLoading: boolean
  periodOptions: SelectionOption[]
  periodSummary: string
  selectedCompanyOption: SelectionOption[]
  selectedHistoryUserOption: SelectionOption[]
  selectedPeriodOption: SelectionOption[]
}

export const HistoryFilters: React.FC<Props> = ({
  canFilterHistory,
  companyOptions,
  customFrom,
  customTo,
  handleCompanyChange,
  handleCustomFromChange,
  handleCustomToChange,
  handleHistoryUserChange,
  handlePeriodChange,
  historyUserOptions,
  isCompaniesLoading,
  isCustomPeriod,
  isPlatformAdmin,
  isUsersLoading,
  periodOptions,
  periodSummary,
  selectedCompanyOption,
  selectedHistoryUserOption,
  selectedPeriodOption,
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
            value="O resumo e a tabela abaixo usam o mesmo intervalo de datas."
            className="text-content-muted"
          />
        </div>

        <Typography
          variant="legal"
          value={`Periodo ativo: ${periodSummary}`}
          className="text-content-muted"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {isPlatformAdmin ? (
          isCompaniesLoading ? (
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

        {canFilterHistory ? (
          isUsersLoading ? (
            <Skeleton className="h-11 w-full rounded-xl" />
          ) : (
            <Select
              label="Colaborador"
              options={historyUserOptions}
              selectedItem={selectedHistoryUserOption}
              buttonClassName="h-11 bg-surface-card"
              onSelectionChange={handleHistoryUserChange}
            />
          )
        ) : null}

        <Select
          label="Periodo"
          options={periodOptions}
          selectedItem={selectedPeriodOption}
          buttonClassName="h-11 bg-surface-card"
          onSelectionChange={handlePeriodChange}
        />

        {isCustomPeriod ? (
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
