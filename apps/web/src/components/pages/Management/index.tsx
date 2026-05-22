// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { SkeletonTable } from "@/components/structure/Skeleton"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { TextSwitch } from "@/components/structure/TextSwitch"
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
    isLoading,
    tableData,
    drawerRef,
    selectedElement,
    getRowKey,
    getActionState,
    handleActionClick,
    handleAddClick,
    handleRowSelect,
    handleTabChange,
  } = useManagement()

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

            <div className="flex flex-wrap items-center justify-between gap-4">
              <TextSwitch
                options={availableTabs}
                value={activeTab}
                onChange={handleTabChange}
              />

              <Button
                value="Adicionar Novo"
                icon="plus"
                iconPlacement="start"
                className="min-w-68"
                onClick={handleAddClick}
              />
            </div>

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
