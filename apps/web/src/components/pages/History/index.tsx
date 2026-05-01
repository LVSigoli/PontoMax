// External Libraries
import React, { useEffect, useRef } from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"
import { AnalysisCard } from "./components/AnalysisCard"
import { AdjustmentRequestSidePanel } from "../PointRegister/components/modals/AdjustmentRequestSidePanel"
import { DayHistorySidePanel } from "../PointRegister/components/modals/DayHistorySidePanel"

// Hooks
import { useHistory } from "./hooks/useHistory"

// Utils
import {
  formatWorkdayDate,
  getPointStatusClass,
} from "../PointRegister/utils"

// Types
import type {
  TableAction,
  TableRowData,
} from "@/components/structure/Table/types"

const POINT_HISTORY_ACTIONS: TableAction[] = [
  {
    id: "request-adjustment",
    label: "Solicitar ajuste",
    color: "text-warning-700",
    icon: "update",
  },
]

export const History: React.FC = () => {
  const {
    analysisItems,
    errorMessage,
    historyRecords,
    isInitialLoading,
    isLoadingMore,
    hasMore,
    selectedHistoryRecord,
    adjustmentRequestWorkdayDate,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    dayHistorySidePanelRef,
    loadMoreHistory,
    handleHistoryRecordSelect,
    handleAdjustmentRequestOpen,
    handleAdjustmentRequestSubmitted,
  } = useHistory()

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreHistory()
        }
      },
      {
        root: null,
        rootMargin: "160px 0px",
        threshold: 0,
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [loadMoreHistory])

  const tableData = historyRecords.map<TableRowData>((record) => ({
    Data: {
      value: formatWorkdayDate(record.workdayDate),
    },
    Registros: {
      value: record.recordsCount,
    },
    "Horas trabalhadas": {
      value: record.workedHours,
    },
    "Horas extras": {
      value: record.extraHours,
    },
    "Horas faltantes": {
      value: record.missingHours,
    },
    Status: {
      value: record.status,
      type: "badge",
      color: getPointStatusClass(record.status),
    },
  }))

  function handlePointHistoryActionClick(actionId: string, item: TableRowData) {
    const recordIndex = tableData.indexOf(item)
    const record = historyRecords[recordIndex]

    if (actionId === "request-adjustment" && record) {
      handleAdjustmentRequestOpen(record)
    }
  }

  function handlePointHistoryRowSelect(item: TableRowData) {
    const recordIndex = tableData.indexOf(item)
    const record = historyRecords[recordIndex]

    if (record) {
      handleHistoryRecordSelect(record)
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Header
              label="Historico de ponto"
              subtitle="Acompanhe e ajuste seus registros anteriores"
            />

            <section className="grid gap-4">
              <Typography
                variant="h4"
                value="Analise de solicitacoes"
                className="text-xl"
              />

              {errorMessage ? (
                <Typography
                  variant="legal"
                  value={errorMessage}
                  className="text-danger-700"
                />
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {analysisItems.map((item) => (
                  <AnalysisCard key={item.type} item={item} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <Header
                  titleVariant="h4"
                  label="Historico de ponto"
                  subtitle="Resumo diario dos dias trabalhados anteriores"
                />

                <Typography
                  variant="caption"
                  value={`${historyRecords.length} dias carregados`}
                />
              </div>

              <Table
                data={tableData}
                getRowKey={(_, index) => historyRecords[index].id}
                allowActions
                actions={POINT_HISTORY_ACTIONS}
                onActionClick={handlePointHistoryActionClick}
                onRowSelect={handlePointHistoryRowSelect}
                emptyMessage="Nenhum historico encontrado"
              />

              <div ref={loadMoreRef} className="flex justify-center pt-4">
                <Typography
                  variant="caption"
                  value={
    isInitialLoading
      ? "Carregando historico..."
      : isLoadingMore
      ? "Carregando mais registros..."
      : hasMore
        ? "Role para carregar mais"
                        : "Todos os registros foram carregados"
                  }
                />
              </div>
            </section>
          </div>
        </section>
      </div>

      <DayHistorySidePanel
        ref={dayHistorySidePanelRef}
        record={selectedHistoryRecord}
      />

      <AdjustmentRequestSidePanel
        ref={adjustmentRequestSidePanelRef}
        records={adjustmentRequestRecords}
        workdayDate={adjustmentRequestWorkdayDate}
        onSubmitted={handleAdjustmentRequestSubmitted}
      />
    </main>
  )
}
