import { Input } from "@/components/structure/Input"
import { Select } from "@/components/structure/Select"
import { Skeleton } from "@/components/structure/Skeleton"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

import type { AnalyticsPeriod } from "@/services/domain"

interface Props {
  companyOptions: SelectionOption[]
  customFrom: string
  customTo: string
  handleCompanyChange: (selection: SelectionOption[]) => void
  handleCustomFromChange: (value: string) => void
  handleCustomToChange: (value: string) => void
  handlePeriodChange: (selection: SelectionOption[]) => void
  isCompaniesLoading: boolean
  isPlatformAdmin: boolean
  periodOptions: SelectionOption[]
  periodSummary: string
  selectedCompanyOption: SelectionOption[]
  selectedPeriod: AnalyticsPeriod
  selectedPeriodOption: SelectionOption[]
}

export const AnalyticsFilters: React.FC<Props> = ({
  companyOptions,
  customFrom,
  customTo,
  handleCompanyChange,
  handleCustomFromChange,
  handleCustomToChange,
  handlePeriodChange,
  isCompaniesLoading,
  isPlatformAdmin,
  periodOptions,
  periodSummary,
  selectedCompanyOption,
  selectedPeriod,
  selectedPeriodOption,
}) => {
  const isCustomPeriod = selectedPeriod === "custom"

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
            value="Todos os indicadores abaixo respeitam o periodo selecionado."
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

        {isCustomPeriod ? (
          <>
            <Input
              title="De"
              value={customFrom}
              type="date"
              onChange={handleCustomFromChange}
            />

            <Input
              title="Ate"
              value={customTo}
              type="date"
              onChange={handleCustomToChange}
            />
          </>
        ) : null}
      </div>
    </section>
  )
}
