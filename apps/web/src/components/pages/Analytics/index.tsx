// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"
import {
  AnalyticsContentSkeleton,
  AnalyticsMetricsSkeleton,
} from "./components/AnalyticsLoading"
import { AnalyticsExportMenu } from "./components/AnalyticsExportMenu"
import { AnalyticsFilters } from "./components/AnalyticsFilters"
import { HourBalanceList } from "./components/HourBalanceList"
import { MetricCard } from "./components/MetricCard"
import { SolicitationBarChart } from "./components/SolicitationBarChart"
import { WorkedHoursLineChart } from "./components/WorkedHoursLineChart"
import { useAnalytics } from "./hooks/useAnalytics"

export const Analytics: React.FC = () => {
  const {
    balances,
    balancesTitle,
    companyOptions,
    customFrom,
    customTo,
    handleCompanyFilterChange,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
    isLoading,
    isCompaniesLoading,
    isPlatformAdmin,
    metrics,
    periodOptions,
    periodSummary,
    selectedPeriod,
    selectedPeriodOption,
    selectedCompanyOption,
    solicitationChart,
    solicitationChartTitle,
    workedHours,
    workedHoursTitle,
  } = useAnalytics()
  const showAnalyticsSkeleton = isLoading

  function handleExportPdf() {
    console.log("export pdf")
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
                subtitle="Acompanhe os principais indicadores operacionais da sua equipe por periodo."
              />

              <div className="w-full flex items-center justify-end sm:w-auto">
                <AnalyticsExportMenu
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                />
              </div>
            </div>

            <AnalyticsFilters
              companyOptions={companyOptions}
              customFrom={customFrom}
              customTo={customTo}
              handleCompanyChange={handleCompanyFilterChange}
              handleCustomFromChange={handleCustomFromChange}
              handleCustomToChange={handleCustomToChange}
              handlePeriodChange={handlePeriodChange}
              isCompaniesLoading={isCompaniesLoading}
              isPlatformAdmin={isPlatformAdmin}
              periodOptions={periodOptions}
              periodSummary={periodSummary}
              selectedCompanyOption={selectedCompanyOption}
              selectedPeriod={selectedPeriod}
              selectedPeriodOption={selectedPeriodOption}
            />

            <section className="grid gap-4">
              <Typography
                variant="h4"
                value="Resumo do periodo"
                className="text-xl"
              />

              {showAnalyticsSkeleton ? (
                <AnalyticsMetricsSkeleton />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {metrics.map((metric) => (
                    <MetricCard key={metric.type} metric={metric} />
                  ))}
                </div>
              )}
            </section>

            {showAnalyticsSkeleton ? (
              <AnalyticsContentSkeleton />
            ) : (
              <section className="grid gap-4 xl:grid-cols-[0.9fr_1.7fr]">
                <HourBalanceList items={balances} title={balancesTitle} />

                <div className="grid gap-4">
                  <SolicitationBarChart
                    items={solicitationChart}
                    title={solicitationChartTitle}
                  />
                  <WorkedHoursLineChart
                    items={workedHours}
                    title={workedHoursTitle}
                  />
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
