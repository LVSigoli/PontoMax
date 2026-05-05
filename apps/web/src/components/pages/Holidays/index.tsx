// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { HolidayDrawer } from "./components/HolidayDrawer"

// Constants
import { HOLIDAY_ACTIONS } from "./constants"

// Contexts
import { HolidaysProvider } from "./contexts/HolidaysContext"

// Hooks
import { useHolidays } from "./hooks/useHolidays"

export const Holidays: React.FC = () => {
  return (
    <HolidaysProvider>
      <HolidaysContent />
    </HolidaysProvider>
  )
}

const HolidaysContent: React.FC = () => {
  const {
    drawerRef,
    selectedElement,
    tableData,
    getRowKey,
    handleActionClick,
    handleAddClick,
    handleRowSelect,
  } = useHolidays()

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header
                label="Gestao de feriados"
                subtitle="Gerencie datas de feriados e relacione as empresas impactadas"
              />

              <Button
                value="Adicionar Novo"
                icon="plus"
                iconPlacement="start"
                className="min-w-68"
                onClick={handleAddClick}
              />
            </div>

            <Table
              allowActions
              minWidth="920px"
              data={tableData}
              actions={HOLIDAY_ACTIONS}
              onActionClick={handleActionClick}
              emptyMessage="Nenhum feriado encontrado"
              className="overflow-hidden rounded-xl bg-surface-card shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
              getRowKey={getRowKey}
              onRowSelect={handleRowSelect}
            />
          </div>
        </section>
      </div>

      <HolidayDrawer ref={drawerRef} element={selectedElement} />
    </main>
  )
}
