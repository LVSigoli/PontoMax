// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Select } from "@/components/structure/Select"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"
import { AdjustmentRequestSidePanel } from "../PointRegister/components/modals/AdjustmentRequestSidePanel"
import { DayHistorySidePanel } from "../PointRegister/components/modals/DayHistorySidePanel"
import { HistoryAnalysisSection } from "./components/HistoryAnalysisSection"
import { HistoryTableSection } from "./components/HistoryTableSection"

// Hooks
import { useHistory } from "./hooks/useHistory"

export const History: React.FC = () => {
  const {
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    adjustmentWorkdayDate,
    analysisItems,
    canFilterHistory,
    dayHistorySidePanelRef,
    errorMessage,
    handleAdjustmentRequestSubmitted,
    handleHistoryActionClick,
    handleHistoryRecordSelect,
    handleHistoryUserChange,
    historyRecords,
    historySubtitle,
    historyUserOptions,
    loadMoreLabel,
    loadMoreRef,
    selectedHistoryRecord,
    selectedHistoryUserOption,
    tableActions,
    tableData,
    getRowKey,
  } = useHistory()

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header label="Historico de ponto" subtitle={historySubtitle} />

              {canFilterHistory ? (
                <section className="w-full max-w-xl rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <Typography
                        variant="b2"
                        value="Visualizar historico de"
                        className="font-semibold"
                      />

                      <Typography
                        variant="legal"
                        value="Selecione um colaborador da sua empresa para trocar o escopo da consulta."
                        className="text-content-muted"
                      />
                    </div>

                    <Select
                      options={historyUserOptions}
                      selectedItem={selectedHistoryUserOption}
                      buttonClassName="h-11"
                      onSelectionChange={handleHistoryUserChange}
                    />
                  </div>
                </section>
              ) : null}
            </div>

            <HistoryAnalysisSection
              items={analysisItems}
              errorMessage={errorMessage}
            />

            <HistoryTableSection
              data={tableData}
              actions={tableActions}
              historyRecordsCount={historyRecords.length}
              loadMoreLabel={loadMoreLabel}
              loadMoreRef={loadMoreRef}
              getRowKey={getRowKey}
              onActionClick={handleHistoryActionClick}
              onRowSelect={handleHistoryRecordSelect}
            />
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
        workdayDate={adjustmentWorkdayDate}
        onSubmitted={handleAdjustmentRequestSubmitted}
      />
    </main>
  )
}
