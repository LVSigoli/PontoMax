// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { AdjustmentRequestSidePanel } from "../PointRegister/components/modals/AdjustmentRequestSidePanel"
import { DayHistorySidePanel } from "../PointRegister/components/modals/DayHistorySidePanel"
import { HistoryFilters } from "./components/HistoryFilters"
import { HistoryAnalysisSection } from "./components/HistoryAnalysisSection"
import {
  HistoryAnalysisSkeleton,
  HistoryTableSkeleton,
} from "./components/HistoryLoading"
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
    companyOptions,
    customFrom,
    customTo,
    dayHistorySidePanelRef,
    handleAdjustmentRequestSubmitted,
    handleHistoryCompanyChange,
    handleCustomFromChange,
    handleCustomToChange,
    handleHistoryActionClick,
    handleHistoryRecordSelect,
    handleHistoryUserChange,
    handlePeriodChange,
    historyRecords,
    historySubtitle,
    historyUserOptions,
    isCompaniesLoading,
    isCustomPeriod,
    isInitialLoading,
    isPlatformAdmin,
    isUsersLoading,
    loadMoreLabel,
    loadMoreRef,
    periodOptions,
    periodSummary,
    selectedCompanyOption,
    selectedHistoryRecord,
    selectedHistoryUserId,
    selectedHistoryUserOption,
    selectedPeriodOption,
    tableActions,
    tableData,
    getRowKey,
  } = useHistory()
  const showHistorySkeleton = isInitialLoading

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header label="Historico de ponto" subtitle={historySubtitle} />
            </div>

            <HistoryFilters
              canFilterHistory={canFilterHistory}
              companyOptions={companyOptions}
              customFrom={customFrom}
              customTo={customTo}
              handleCompanyChange={handleHistoryCompanyChange}
              handleCustomFromChange={handleCustomFromChange}
              handleCustomToChange={handleCustomToChange}
              handleHistoryUserChange={handleHistoryUserChange}
              handlePeriodChange={handlePeriodChange}
              historyUserOptions={historyUserOptions}
              isCompaniesLoading={isCompaniesLoading}
              isCustomPeriod={isCustomPeriod}
              isPlatformAdmin={isPlatformAdmin}
              isUsersLoading={isUsersLoading}
              periodOptions={periodOptions}
              periodSummary={periodSummary}
              selectedCompanyOption={selectedCompanyOption}
              selectedHistoryUserOption={selectedHistoryUserOption}
              selectedPeriodOption={selectedPeriodOption}
            />

            {showHistorySkeleton ? (
              <HistoryAnalysisSkeleton />
            ) : (
              <HistoryAnalysisSection items={analysisItems} />
            )}

            {showHistorySkeleton ? (
              <HistoryTableSkeleton />
            ) : (
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
            )}
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
        targetUserId={selectedHistoryUserId}
        workdayDate={adjustmentWorkdayDate}
        onSubmitted={handleAdjustmentRequestSubmitted}
      />
    </main>
  )
}
