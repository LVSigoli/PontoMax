// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { SolicitationCard } from "./components/SolicitationCard"
import { SolicitationsFilters } from "./components/SolicitationsFilters"
import { SolicitationsGridSkeleton } from "./components/SolicitationsLoading"
import { SolicitationDrawer } from "./components/SolicitationDrawer"

// Hooks
import { SolicitationsProvider } from "./contexts/SolicitationsContext"
import { useSolicitations } from "./hooks/useSolicitations"
import { useSolicitationsFilters } from "./hooks/useSolicitationsFilters"

export const Solicitations: React.FC = () => {
  const filters = useSolicitationsFilters()

  return (
    <SolicitationsProvider filters={filters.requestParams}>
      <SolicitationsContent {...filters} />
    </SolicitationsProvider>
  )
}

interface SolicitationsContentProps {
  companyOptions: ReturnType<typeof useSolicitationsFilters>["companyOptions"]
  customFrom: string
  customTo: string
  isCompaniesLoading: boolean
  isCustomPeriod: boolean
  isPlatformAdmin: boolean
  periodOptions: ReturnType<typeof useSolicitationsFilters>["periodOptions"]
  periodSummary: string
  search: string
  selectedCompanyOption: ReturnType<typeof useSolicitationsFilters>["selectedCompanyOption"]
  selectedPeriod: ReturnType<typeof useSolicitationsFilters>["selectedPeriod"]
  selectedPeriodOption: ReturnType<typeof useSolicitationsFilters>["selectedPeriodOption"]
  selectedStatusOption: ReturnType<typeof useSolicitationsFilters>["selectedStatusOption"]
  statusOptions: ReturnType<typeof useSolicitationsFilters>["statusOptions"]
  handleCompanyChange: ReturnType<typeof useSolicitationsFilters>["handleCompanyChange"]
  handleCustomFromChange: ReturnType<typeof useSolicitationsFilters>["handleCustomFromChange"]
  handleCustomToChange: ReturnType<typeof useSolicitationsFilters>["handleCustomToChange"]
  handlePeriodChange: ReturnType<typeof useSolicitationsFilters>["handlePeriodChange"]
  handleSearchChange: ReturnType<typeof useSolicitationsFilters>["handleSearchChange"]
  handleStatusFilterChange: ReturnType<typeof useSolicitationsFilters>["handleStatusFilterChange"]
}

const SolicitationsContent: React.FC<SolicitationsContentProps> = ({
  companyOptions,
  customFrom,
  customTo,
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
  const {
    drawerRef,
    filteredSolicitations,
    isLoading,
    selectedElement,
    handleSolicitationSelect,
  } = useSolicitations({ search })

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <Header
              label="Gestao de ajustes"
              subtitle="Gerencie as solicitacoes de ajuste de ponto dos funcionarios"
            />

            <SolicitationsFilters
              companyOptions={companyOptions}
              customFrom={customFrom}
              customTo={customTo}
              filteredCount={filteredSolicitations.length}
              isCompaniesLoading={isCompaniesLoading}
              isCustomPeriod={isCustomPeriod}
              isPlatformAdmin={isPlatformAdmin}
              periodOptions={periodOptions}
              periodSummary={periodSummary}
              search={search}
              selectedCompanyOption={selectedCompanyOption}
              selectedPeriod={selectedPeriod}
              selectedPeriodOption={selectedPeriodOption}
              selectedStatusOption={selectedStatusOption}
              statusOptions={statusOptions}
              handleCompanyChange={handleCompanyChange}
              handleCustomFromChange={handleCustomFromChange}
              handleCustomToChange={handleCustomToChange}
              handlePeriodChange={handlePeriodChange}
              handleSearchChange={handleSearchChange}
              handleStatusFilterChange={handleStatusFilterChange}
            />

            {isLoading && filteredSolicitations.length === 0 ? (
              <SolicitationsGridSkeleton />
            ) : (
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {filteredSolicitations.map((solicitation) => (
                  <SolicitationCard
                    key={solicitation.id}
                    solicitation={solicitation}
                    onClick={handleSolicitationSelect}
                  />
                ))}
              </section>
            )}
          </div>
        </section>
      </div>

      <SolicitationDrawer ref={drawerRef} element={selectedElement} />
    </main>
  )
}
