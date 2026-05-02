// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { AdjustmentRequestSidePanel } from "../PointRegister/components/modals/AdjustmentRequestSidePanel"
import { DayHistorySidePanel } from "../PointRegister/components/modals/DayHistorySidePanel"
import { HistoryAnalysisSection } from "./components/HistoryAnalysisSection"
import { HistoryTableSection } from "./components/HistoryTableSection"

// Hooks
import { useHistory } from "./hooks/useHistory"

export const History: React.FC = () => {
  const {
    tableData,
    loadMoreRef,
    loadMoreLabel,
    tableActions,
    analysisItems,
    errorMessage,
    historyRecords,
    selectedHistoryRecord,
    adjustmentWorkdayDate,
    adjustmentRequestRecords,
    adjustmentRequestSidePanelRef,
    dayHistorySidePanelRef,
    getRowKey,
    handleHistoryRecordSelect,
    handleHistoryActionClick,
    handleAdjustmentRequestSubmitted,
  } = useHistory()

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
