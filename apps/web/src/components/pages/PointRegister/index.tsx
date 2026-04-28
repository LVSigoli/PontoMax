// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { CurrentRegisters } from "./components/CurrentRegister"
import { AdjustmentRequestSidePanel } from "./components/modals/AdjustmentRequestSidePanel"
import { ConfirmationModal } from "./components/modals/ConfirmationModal"
import { DayHistorySidePanel } from "./components/modals/DayHistorySidePanel"
import { PointCard } from "./components/PointCard"
import { PointHistory } from "./components/PointHistory"

// Hooks
import { usePointRegister } from "./hooks"

export const PointRegister: React.FC = () => {
  const {
    historyRecords,
    currentDate,
    currentTime,
    remainingTime,
    workedHours,
    balanceLabel,
    adjustmentRequestWorkdayDate,
    currentRecords,
    adjustmentRequestRecords,
    confirmationModalRef,
    selectedHistoryRecord,
    dayHistorySidePanelRef,
    adjustmentRequestSidePanelRef,
    handleRegisterPoint,
    handleAdjustmentRequestSubmitted,
    handleHistoryRecordSelect,
    handleAdjustmentRequestOpen,
    handleConfirmationModalOpen,
  } = usePointRegister()

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Header
              label="Registro de ponto"
              subtitle="Registre suas entradas e saidas com acompanhamento diario"
            />

            <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
              <PointCard
                currentDate={currentDate}
                remainingTime={remainingTime}
                workedHours={workedHours}
                balanceLabel={balanceLabel}
                onRegisterPoint={handleConfirmationModalOpen}
              />

              <CurrentRegisters records={currentRecords} />
            </div>

            <PointHistory
              records={historyRecords}
              onAdjustmentRequest={handleAdjustmentRequestOpen}
              onRecordSelect={handleHistoryRecordSelect}
            />
          </div>
        </section>
      </div>

      <ConfirmationModal
        ref={confirmationModalRef}
        currentTime={currentTime}
        onConfirm={handleRegisterPoint}
      />

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
