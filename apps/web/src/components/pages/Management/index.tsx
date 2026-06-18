// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Select } from "@/components/structure/Select"
import { SkeletonTable } from "@/components/structure/Skeleton"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { TextSwitch } from "@/components/structure/TextSwitch"
import type { SelectionOption } from "@/components/structure/Select/types"
import { ManagementFilters } from "./components/ManagementFilters"
import { ManagementDrawer } from "./components/ManagementDrawer"

// Constants
import { MANAGEMENT_ACTIONS } from "./constants"

// Contexts
import { ManagementProvider } from "./contexts/ManagementContext"

// Hooks
import { useManagement } from "./hooks/useManagement"

// Types

export const Management: React.FC = () => {
  return (
    <ManagementProvider>
      <ManagementContent />
    </ManagementProvider>
  )
}

const ManagementContent: React.FC = () => {
  // Hooks
  const {
    availableTabs,
    activeTab,
    companyOptions,
    isLoading,
    isPlatformAdmin,
    resultLabel,
    roleOptions,
    search,
    selectedCompanyOption,
    selectedRoleOption,
    showCompanyFilter,
    showRoleFilter,
    tableData,
    drawerRef,
    selectedElement,
    getRowKey,
    getActionState,
    handleActionClick,
    handleAddClick,
    handleCompanyChange,
    handleRoleChange,
    handleRowSelect,
    handleSearchChange,
    handleTabChange,
  } = useManagement()
  const responsiveTabOptions: SelectionOption[] = availableTabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
    icon: tab.icon,
  }))
  const selectedResponsiveTab = responsiveTabOptions.find(
    (option) => option.value === activeTab.id
  )

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <Header
              label="Gestao"
              subtitle="Gerencie empresas, funcionarios e configuracoes de jornada"
            />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Select
                label="Selecione a visao"
                options={responsiveTabOptions}
                selectedItem={selectedResponsiveTab ? [selectedResponsiveTab] : []}
                onSelectionChange={(selection) => {
                  const nextTab = availableTabs.find(
                    (tab) => tab.id === selection[0]?.value
                  )

                  if (nextTab) {
                    handleTabChange(nextTab)
                  }
                }}
                className="w-full md:hidden"
                buttonClassName="shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              />

              <div className="hidden md:inline-flex">
                <TextSwitch
                  options={availableTabs}
                  value={activeTab}
                  onChange={handleTabChange}
                />
              </div>

              <Button
                value="Adicionar Novo"
                icon="plus"
                iconPlacement="start"
                className="w-full md:w-fit md:min-w-68"
                onClick={handleAddClick}
              />
            </div>

            <ManagementFilters
              activeTabId={activeTab.id}
              companyOptions={companyOptions}
              isPlatformAdmin={isPlatformAdmin}
              resultLabel={resultLabel}
              roleOptions={roleOptions}
              search={search}
              selectedCompanyOption={selectedCompanyOption}
              selectedRoleOption={selectedRoleOption}
              showCompanyFilter={showCompanyFilter}
              showRoleFilter={showRoleFilter}
              handleCompanyChange={handleCompanyChange}
              handleRoleChange={handleRoleChange}
              handleSearchChange={handleSearchChange}
            />

            {isLoading ? (
              <SkeletonTable
                columns={activeTab.id === "companies" ? 4 : 6}
                rows={6}
                hasActions
                className="shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
              />
            ) : (
              <Table
                allowActions
                minWidth="860px"
                data={tableData}
                actions={MANAGEMENT_ACTIONS}
                onActionClick={handleActionClick}
                getActionState={getActionState}
                emptyMessage="Nenhum registro encontrado"
                className="overflow-hidden rounded-xl bg-surface-card shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
                getRowKey={getRowKey}
                onRowSelect={handleRowSelect}
              />
            )}
          </div>
        </section>
      </div>

      <ManagementDrawer
        ref={drawerRef}
        view={activeTab}
        element={selectedElement}
      />
    </main>
  )
}
