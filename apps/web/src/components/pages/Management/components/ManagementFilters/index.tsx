import { SearchInput } from "@/components/structure/SearchInput"
import { Select } from "@/components/structure/Select"
import type { SelectionOption } from "@/components/structure/Select/types"
import { Typography } from "@/components/structure/Typography"

import type { ManagementTabId } from "../../types"

interface Props {
  activeTabId: ManagementTabId
  companyOptions: SelectionOption[]
  isPlatformAdmin: boolean
  resultLabel: string
  roleOptions: SelectionOption[]
  search: string
  selectedCompanyOption: SelectionOption[]
  selectedRoleOption: SelectionOption[]
  showCompanyFilter: boolean
  showRoleFilter: boolean
  handleCompanyChange: (selection: SelectionOption[]) => void
  handleRoleChange: (selection: SelectionOption[]) => void
  handleSearchChange: (value: string) => void
}

export const ManagementFilters: React.FC<Props> = ({
  activeTabId,
  companyOptions,
  isPlatformAdmin,
  resultLabel,
  roleOptions,
  search,
  selectedCompanyOption,
  selectedRoleOption,
  showCompanyFilter,
  showRoleFilter,
  handleCompanyChange,
  handleRoleChange,
  handleSearchChange,
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
            value="Use a busca contextual e aplique filtros adicionais conforme a aba ativa."
            className="text-content-muted"
          />
        </div>

        <Typography
          variant="legal"
          value={resultLabel}
          className="text-content-muted"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          search={handleSearchChange}
          value={search}
          placeHolder={buildSearchPlaceholder(activeTabId)}
          className="xl:col-span-2"
          startIcon="search"
        />

        {showCompanyFilter && isPlatformAdmin ? (
          <Select
            label="Empresa"
            options={companyOptions}
            selectedItem={selectedCompanyOption}
            buttonClassName="h-11 bg-surface-card"
            onSelectionChange={handleCompanyChange}
          />
        ) : null}

        {showRoleFilter ? (
          <Select
            label="Cargo"
            options={roleOptions}
            selectedItem={selectedRoleOption}
            buttonClassName="h-11 bg-surface-card"
            onSelectionChange={handleRoleChange}
          />
        ) : null}
      </div>
    </section>
  )
}

function buildSearchPlaceholder(activeTabId: ManagementTabId) {
  if (activeTabId === "companies") {
    return "Busque por empresa ou CNPJ..."
  }

  if (activeTabId === "employees") {
    return "Busque por nome, email, cargo ou jornada..."
  }

  return "Busque por jornada, descricao ou escala..."
}
