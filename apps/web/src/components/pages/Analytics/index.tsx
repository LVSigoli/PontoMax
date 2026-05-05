// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Select } from "@/components/structure/Select"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"
import { HourBalanceList } from "./components/HourBalanceList"
import { MetricCard } from "./components/MetricCard"
import { SolicitationBarChart } from "./components/SolicitationBarChart"
import { WorkedHoursLineChart } from "./components/WorkedHoursLineChart"
import { useAnalytics } from "./hooks/useAnalytics"

export const Analytics: React.FC = () => {
  const {
    balances,
    companyOptions,
    errorMessage,
    handleCompanyFilterChange,
    isPlatformAdmin,
    metrics,
    selectedCompanyOption,
    solicitationChart,
    workedHours,
  } = useAnalytics()

  function handleExportReport() {
    console.log("export report")
  }

  function handleExportExcel() {
    console.log("export excel")
  }

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className=" w-full flex flex-wrap items-start justify-between gap-4">
              <Header
                label="Painel Gerencial"
                subtitle="Receba analise detalhada das horas trabalhadas na sua empresa"
              />

              <div className="w-full flex flex-wrap items-center gap-2">
                {isPlatformAdmin ? (
                  <div className="w-full min-w-64 sm:w-72">
                    <Select
                      options={companyOptions}
                      selectedItem={selectedCompanyOption}
                      buttonClassName="h-11 bg-surface-card"
                      onSelectionChange={handleCompanyFilterChange}
                    />
                  </div>
                ) : null}

                <div className="w-full flex flex-row items-center justify-between gap-2 ">
                  <Button
                    fitWidth
                    value="Exportar Relatorio"
                    color="primary"
                    variant="outlined"
                    onClick={handleExportReport}
                  />

                  <Button
                    fitWidth
                    value="Exportar excel"
                    onClick={handleExportExcel}
                  />
                </div>
              </div>
            </div>

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
                {metrics.map((metric) => (
                  <MetricCard key={metric.type} metric={metric} />
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[0.9fr_1.7fr]">
              <HourBalanceList items={balances} />

              <div className="grid gap-4">
                <SolicitationBarChart items={solicitationChart} />
                <WorkedHoursLineChart items={workedHours} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
