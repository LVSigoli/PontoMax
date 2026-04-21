// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"
import { AnalysisCard } from "./components/AnalysisCard"

// Constants
import {
  SOLICITATION_ACTIONS,
  SOLICITATION_HISTORY,
  USER_ANALYSIS,
} from "./constants"

// Types
import type { TableRowData } from "@/components/structure/Table/types"

// Utils
import { getSolicitationStatusClass } from "./utils"

export const History: React.FC = () => {
  const tableData = SOLICITATION_HISTORY.map<TableRowData>((item) => ({
    "Horario da ultima solicitacao": {
      value: item.lastSolicitationTime,
      color: "text-content-secondary",
    },
    "Horas extras": {
      value: item.extraHours,
      color: "text-content-secondary",
    },
    "Horas faltantes": {
      value: item.missingHours,
      color: "text-content-secondary",
    },
    Status: {
      value: item.status,
      type: "badge",
      color: getSolicitationStatusClass(item.status),
    },
  }))

  function handleActionClick(actionId: string, row: TableRowData) {
    console.log("history action", {
      actionId,
      row,
    })
  }

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            label="Histórico de Solicitações"
            subtitle="Acompanhe e ajuste suas solicitações"
          />

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-4">
              <Typography
                variant="h4"
                value="Analise de solicitacoes"
                className="text-xl"
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {USER_ANALYSIS.map((item) => (
                  <AnalysisCard key={item.type} item={item} />
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <Typography
                variant="h4"
                value="Historico de solicitacoes"
                className="text-xl"
              />

              <Table
                data={tableData}
                allowActions
                actions={SOLICITATION_ACTIONS}
                className="overflow-hidden rounded-xl bg-surface-card shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
                emptyMessage="Nenhuma solicitacao encontrada"
                getRowKey={(_, index) => SOLICITATION_HISTORY[index].id}
                minWidth="760px"
                onActionClick={handleActionClick}
              />
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
