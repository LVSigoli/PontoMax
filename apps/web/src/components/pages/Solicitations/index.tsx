// External Libraries
import React from "react"

// Assets
import SearchIcon from "@/assets/icons/search.svg"

// Components
import { Header } from "@/components/structure/Header"
import { SearchInput } from "@/components/structure/SearchInput"
import { Select } from "@/components/structure/Select"
import { Sidebar } from "@/components/structure/Sidebar"
import { SolicitationCard } from "./components/SolicitationCard"
import { SolicitationDrawer } from "./components/SolicitationDrawer"

// Constants
import { SOLICITATION_STATUS_OPTIONS } from "./constants"

// Contexts
import { SolicitationsProvider } from "./contexts/SolicitationsContext"

// Hooks
import { useSolicitations } from "./hooks/useSolicitations"

export const Solicitations: React.FC = () => {
  return (
    <SolicitationsProvider>
      <SolicitationsContent />
    </SolicitationsProvider>
  )
}

const SolicitationsContent: React.FC = () => {
  const {
    drawerRef,
    filteredSolicitations,
    search,
    selectedElement,
    statusFilter,
    handleSearchChange,
    handleSolicitationSelect,
    handleStatusFilterChange,
  } = useSolicitations()

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

            <div className="flex flex-wrap items-center justify-between gap-4">
              <SearchInput
                search={handleSearchChange}
                value={search}
                placeHolder="Busque por usuario..."
                className="w-full max-w-xl"
                startIcon={SearchIcon}
              />

              <div className="flex w-full max-w-50 items-center gap-2 rounded-lg bg-surface-muted px-3">
                <Select
                  options={SOLICITATION_STATUS_OPTIONS}
                  selectedItem={SOLICITATION_STATUS_OPTIONS.filter(
                    (option) => option.value === statusFilter
                  )}
                  buttonClassName="h-11"
                  className="flex-1"
                  onSelectionChange={handleStatusFilterChange}
                />
              </div>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredSolicitations.map((solicitation) => (
                <SolicitationCard
                  key={solicitation.id}
                  solicitation={solicitation}
                  onClick={handleSolicitationSelect}
                />
              ))}
            </section>
          </div>
        </section>
      </div>

      <SolicitationDrawer ref={drawerRef} element={selectedElement} />
    </main>
  )
}
