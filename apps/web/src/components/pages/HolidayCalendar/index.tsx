import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"

import { CalendarFilters } from "./components/CalendarFilters"
import { CalendarCompaniesEmptyState } from "./components/CalendarCompaniesEmptyState"
import { CalendarEmptyState } from "./components/CalendarEmptyState"
import { CalendarSkeleton } from "./components/CalendarSkeleton"
import { CalendarSummary } from "./components/CalendarSummary"
import { MonthCalendarGrid } from "./components/MonthCalendarGrid"
import { MonthHolidayList } from "./components/MonthHolidayList"
import { useHolidayCalendar } from "./hooks/useHolidayCalendar"

export function HolidayCalendar() {
  const calendar = useHolidayCalendar()
  const nationalCount = calendar.monthHolidays.filter(
    (holiday) => holiday.type === "Nacional"
  ).length

  return (
    <main className="relative h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="relative flex h-full overflow-hidden">
        <Sidebar />
        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header
                label="Calendário de feriados"
                subtitle="Consulte os feriados ativos da empresa e navegue por mês e ano."
              />
              <Button
                value="Hoje"
                variant="outlined"
                color="primary"
                className="min-w-28"
                onClick={calendar.handleResetToToday}
              />
            </div>

            <CalendarFilters
              companyOptions={calendar.companyOptions}
              yearOptions={calendar.yearOptions}
              selectedCompanyOption={calendar.selectedCompanyOption}
              selectedMonthOption={calendar.selectedMonthOption}
              selectedYearOption={calendar.selectedYearOption}
              selectedCompanyLabel={calendar.selectedCompanyLabel}
              isPlatformAdmin={calendar.isPlatformAdmin}
              isCompaniesLoading={calendar.isCompaniesLoading}
              onCompanyChange={calendar.handleCompanyChange}
              onMonthChange={calendar.handleMonthChange}
              onYearChange={calendar.handleYearChange}
            />

            {!calendar.isCalendarReady ? (
              <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
                <Typography
                  variant="b2"
                  value={
                    calendar.isCompaniesLoading
                      ? "Carregando empresas"
                      : "Escolha uma empresa"
                  }
                  className="font-semibold"
                />
                {calendar.isCompaniesLoading ? (
                  <CalendarSkeleton />
                ) : calendar.companyOptions.length === 0 ? (
                  <CalendarCompaniesEmptyState />
                ) : (
                  <CalendarEmptyState />
                )}
              </section>
            ) : calendar.showLoadingState ? (
              <CalendarSkeleton />
            ) : (
              <>
                <CalendarSummary
                  total={calendar.monthHolidays.length}
                  national={nationalCount}
                  company={calendar.monthHolidays.length - nationalCount}
                  monthLabel={calendar.monthLabel}
                  companyLabel={calendar.selectedCompanyLabel}
                />
                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                  <MonthCalendarGrid
                    cells={calendar.calendarCells}
                    monthLabel={calendar.monthLabel}
                  />
                  <MonthHolidayList holidays={calendar.monthHolidays} />
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
