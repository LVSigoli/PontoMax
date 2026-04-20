// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { CurrentRegisters } from "./components/CurrentRegister"
import { ConfirmationModal } from "./components/modals/ConfirmationModal"
import { PointCard } from "./components/PointCard"
import { PointHistory } from "./components/PointHistory"

// Hooks
import { usePointRegister } from "./hooks"

export const PointRegister: React.FC = () => {
  // Hooks
  const {
    records,
    currentDate,
    currentTime,
    currentRecords,
    confirmationModalRef,
    handleRegisterPoint,
    handleConfirmationModalOpen,
  } = usePointRegister()

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            label="Regisitro de ponto"
            subtitle="Registre suas entradas e saídascom acompanhamento diário"
          />

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
            <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
              <PointCard
                currentDate={currentDate}
                currentTime={currentTime}
                onRegisterPoint={handleConfirmationModalOpen}
              />

              <CurrentRegisters records={currentRecords} />
            </div>

            <PointHistory records={records} />
          </div>
        </section>
      </div>

      <ConfirmationModal
        ref={confirmationModalRef}
        currentTime={currentTime}
        onConfirm={handleRegisterPoint}
      />
    </main>
  )
}
