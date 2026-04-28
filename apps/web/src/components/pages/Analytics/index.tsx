// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"
import { HourBalanceList } from "./components/HourBalanceList"
import { MetricCard } from "./components/MetricCard"
import { SolicitationBarChart } from "./components/SolicitationBarChart"
import { WorkedHoursLineChart } from "./components/WorkedHoursLineChart"
import { useAnalytics } from "./hooks/useAnalytics"

export const Analytics: React.FC = () => {
  const { balances, errorMessage, metrics, solicitationChart, workedHours } =
    useAnalytics()

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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header
                label="Painel Gerencial"
                subtitle="Receba analise detalhada das horas trabalhadas na sua empresa"
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  value="Exportar Relatorio"
                  color="primary"
                  variant="outlined"
                  className="min-w-48"
                  onClick={handleExportReport}
                />

                <Button
                  value="Exportar excel"
                  className="min-w-48"
                  onClick={handleExportExcel}
                />
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
