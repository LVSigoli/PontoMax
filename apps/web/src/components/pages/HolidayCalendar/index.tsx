// External Libraries
import React, { useEffect, useMemo, useState } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Select } from "@/components/structure/Select"
import { Sidebar } from "@/components/structure/Sidebar"
import { Skeleton } from "@/components/structure/Skeleton"
import { Typography } from "@/components/structure/Typography"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Hooks
import { useCompaniesSWR, useHolidaysSWR } from "@/hooks/swr"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"

// Utils
import {
  formatHolidayCompanies,
  formatHolidayDate,
  mapHolidayApiToHoliday,
} from "../Holidays/utils"
import type { Holiday } from "../Holidays/types"
import {
  buildMonthGrid,
  formatMonthLabel,
  HOLIDAY_TYPE_META,
  MONTH_OPTIONS,
  WEEKDAY_LABELS,
} from "./utils"

export const HolidayCalendar: React.FC = () => {
  const { user } = useAuth()
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedCompanyId, setSelectedCompanyId] = useState(() =>
    user?.companyId ? String(user.companyId) : ""
  )

  const { data: companyItems = [], isLoading: isCompaniesLoading } =
    useCompaniesSWR({
      enabled: isPlatformAdmin,
    })

  const companyOptions = useMemo<SelectionOption[]>(
    () =>
      companyItems.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    [companyItems]
  )

  useEffect(() => {
    if (!isPlatformAdmin) return

    const hasSelectedCompany = companyOptions.some(
      (option) => option.value === selectedCompanyId
    )

    if (hasSelectedCompany) return

    const preferredCompanyId = user?.companyId?.toString()
    const fallbackCompanyId =
      preferredCompanyId &&
      companyOptions.some((option) => option.value === preferredCompanyId)
        ? preferredCompanyId
        : companyOptions[0]?.value ?? ""

    if (fallbackCompanyId) {
      setSelectedCompanyId(fallbackCompanyId)
    }
  }, [companyOptions, isPlatformAdmin, selectedCompanyId, user?.companyId])

  const companyIdForQuery =
    isPlatformAdmin && selectedCompanyId
      ? Number(selectedCompanyId)
      : undefined
  const canLoadHolidays = !isPlatformAdmin || Boolean(selectedCompanyId)

  const { data: holidayItems = [], isLoading: isHolidaysLoading } =
    useHolidaysSWR(
      {
        companyId: companyIdForQuery,
        year: selectedYear,
      },
      {
        enabled: canLoadHolidays,
        keepPreviousData: true,
      }
    )

  const holidays = useMemo<Holiday[]>(
    () =>
      holidayItems
        .map(mapHolidayApiToHoliday)
        .filter((holiday) => holiday.isActive),
    [holidayItems]
  )

  const monthPrefix = useMemo(
    () => `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
    [selectedMonth, selectedYear]
  )
  const monthHolidays = useMemo(
    () => holidays.filter((holiday) => holiday.date.startsWith(monthPrefix)),
    [holidays, monthPrefix]
  )
  const calendarCells = useMemo(
    () => buildMonthGrid(selectedYear, selectedMonth, monthHolidays),
    [monthHolidays, selectedMonth, selectedYear]
  )
  const monthLabel = useMemo(
    () => formatMonthLabel(selectedYear, selectedMonth),
    [selectedMonth, selectedYear]
  )
  const yearOptions = useMemo<SelectionOption[]>(() => {
    const years = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index)

    return years.map((year) => ({
      value: String(year),
      label: String(year),
    }))
  }, [currentYear])

  const selectedMonthOption = useMemo(
    () => MONTH_OPTIONS.filter((option) => option.value === String(selectedMonth)),
    [selectedMonth]
  )
  const selectedYearOption = useMemo(
    () => yearOptions.filter((option) => option.value === String(selectedYear)),
    [selectedYear, yearOptions]
  )
  const selectedCompanyOption = useMemo(
    () =>
      companyOptions.filter((option) => option.value === selectedCompanyId),
    [companyOptions, selectedCompanyId]
  )

  const selectedCompanyLabel =
    isPlatformAdmin
      ? selectedCompanyOption[0]?.label ?? "Selecione uma empresa"
      : user?.companyName?.trim() || "Sua empresa"

  const isCalendarReady = !isPlatformAdmin || Boolean(selectedCompanyId)
  const showLoadingState =
    (isHolidaysLoading && monthHolidays.length === 0) ||
    (isPlatformAdmin && !selectedCompanyId && isCompaniesLoading)

  const totalHolidayCount = monthHolidays.length
  const nationalHolidayCount = monthHolidays.filter(
    (holiday) => holiday.type === "Nacional"
  ).length
  const companyHolidayCount = monthHolidays.filter(
    (holiday) => holiday.type !== "Nacional"
  ).length

  function handleCompanyChange(selection: SelectionOption[]) {
    const nextCompanyId = selection[0]?.value

    if (!nextCompanyId) return

    setSelectedCompanyId(nextCompanyId)
  }

  function handleMonthChange(selection: SelectionOption[]) {
    const nextMonth = Number(selection[0]?.value)

    if (Number.isNaN(nextMonth)) return

    setSelectedMonth(nextMonth)
  }

  function handleYearChange(selection: SelectionOption[]) {
    const nextYear = Number(selection[0]?.value)

    if (Number.isNaN(nextYear)) return

    setSelectedYear(nextYear)
  }

  function handleResetToToday() {
    const today = new Date()

    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  return (
    <main className="relative h-screen overflow-hidden bg-surface-page text-content-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_38%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_36%)]"
      />

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
                onClick={handleResetToToday}
              />
            </div>

            <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                  <Typography
                    variant="b2"
                    value="Filtros do calendário"
                    className="font-semibold"
                  />

                  <Typography
                    variant="legal"
                    value="Empresa, mês e ano definem quais feriados serão exibidos."
                    className="text-content-muted"
                  />
                </div>

                <Typography
                  variant="legal"
                  value={selectedCompanyLabel}
                  className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {isPlatformAdmin ? (
                  isCompaniesLoading && companyOptions.length === 0 ? (
                    <Skeleton className="h-11 w-full rounded-xl" />
                  ) : companyOptions.length === 0 ? (
                    <div className="grid gap-1 rounded-xl border border-border-default bg-surface-page px-4 py-3">
                      <Typography
                        variant="legal"
                        value="Empresa"
                        className="text-content-muted"
                      />

                      <Typography
                        variant="b2"
                        value="Nenhuma empresa disponível"
                      />
                    </div>
                  ) : (
                    <Select
                      label="Empresa"
                      options={companyOptions}
                      selectedItem={selectedCompanyOption}
                      buttonClassName="h-11 bg-surface-card"
                      onSelectionChange={handleCompanyChange}
                    />
                  )
                ) : (
                  <div className="grid gap-1 rounded-xl border border-border-default bg-surface-page px-4 py-3">
                    <Typography
                      variant="legal"
                      value="Empresa"
                      className="text-content-muted"
                    />

                    <Typography variant="b2" value={selectedCompanyLabel} />
                  </div>
                )}

                <Select
                  label="Mês"
                  options={MONTH_OPTIONS}
                  selectedItem={selectedMonthOption}
                  buttonClassName="h-11 bg-surface-card"
                  onSelectionChange={handleMonthChange}
                />

                <Select
                  label="Ano"
                  options={yearOptions}
                  selectedItem={selectedYearOption}
                  buttonClassName="h-11 bg-surface-card"
                  onSelectionChange={handleYearChange}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(HOLIDAY_TYPE_META).map(([type, meta]) => (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${meta.badgeClassName}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${meta.dotClassName}`}
                    />
                    {meta.label}
                  </span>
                ))}

                <Typography
                  variant="legal"
                  value="Somente feriados ativos aparecem no calendário."
                  className="ml-auto text-content-muted"
                />
              </div>
            </section>

            {!isCalendarReady ? (
              <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                <div className="grid gap-1">
                  <Typography
                    variant="b2"
                    value={
                      isCompaniesLoading
                        ? "Carregando empresas"
                        : "Escolha uma empresa"
                    }
                    className="font-semibold"
                  />

                  <Typography
                    variant="legal"
                    value={
                      isCompaniesLoading
                        ? "Estamos buscando as empresas disponíveis para montar o calendário."
                        : "Selecione uma empresa para visualizar os feriados do período."
                    }
                    className="text-content-muted"
                  />
                </div>

                {isCompaniesLoading ? (
                  <CalendarSkeleton />
                ) : companyOptions.length === 0 ? (
                  <CalendarCompaniesEmptyState />
                ) : (
                  <CalendarEmptyState />
                )}
              </section>
            ) : showLoadingState ? (
              <CalendarSkeleton />
            ) : (
              <>
                <section className="grid gap-3 sm:grid-cols-3">
                  <SummaryCard
                    label="Feriados do mês"
                    value={totalHolidayCount}
                    subtitle={`No período de ${monthLabel.toLowerCase()}`}
                  />

                  <SummaryCard
                    label="Nacionais"
                    value={nationalHolidayCount}
                    subtitle="Aplicados para todas as empresas"
                  />

                  <SummaryCard
                    label="Escopo da empresa"
                    value={companyHolidayCount}
                    subtitle={selectedCompanyLabel}
                  />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                  <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <Typography
                          variant="h4"
                          value={monthLabel}
                          className="text-lg font-semibold sm:text-xl"
                        />

                        <Typography
                          variant="legal"
                          value="Cada célula destaca os feriados ativos do dia."
                          className="text-content-muted"
                        />

                        <Typography
                          variant="legal"
                          value="No celular, deslize horizontalmente para ver a semana completa."
                          className="text-content-muted sm:hidden"
                        />
                      </div>

                      <Typography
                        variant="legal"
                        value={`${calendarCells.filter((cell) => cell.holidays.length > 0).length} dia(s) com feriado`}
                        className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
                      />
                    </div>

                    <div className="-mx-1 overflow-x-auto px-1 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
                      <div className="grid min-w-[640px] grid-cols-7 gap-1.5 sm:min-w-0 sm:gap-2">
                        {WEEKDAY_LABELS.map((weekday) => (
                          <div
                            key={weekday}
                            className="rounded-xl bg-surface-page px-2 py-2 text-center sm:px-3"
                          >
                            <Typography
                              variant="legal"
                              value={weekday}
                              className="font-semibold text-content-muted"
                            />
                          </div>
                        ))}

                        {calendarCells.map((cell) => {
                          const day = cell.date.getDate()

                          return (
                            <div
                              key={cell.dateKey}
                              className={`min-h-20 rounded-2xl border p-2 transition sm:min-h-28 sm:p-3 ${
                                cell.isCurrentMonth
                                  ? "border-border-subtle bg-surface-page"
                                  : "border-dashed border-border-subtle bg-surface-muted/30 text-content-muted"
                              } ${
                                cell.isToday
                                  ? "border-border-focus shadow-[0_0_0_1px_rgba(59,130,246,0.12)]"
                                  : ""
                              }`}
                            >
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <Typography
                                  variant="b2"
                                  value={String(day)}
                                  className={`text-sm font-semibold sm:text-base ${
                                    cell.isCurrentMonth
                                      ? "text-content-primary"
                                      : "text-content-muted"
                                  }`}
                                />

                                {cell.isToday ? (
                                  <span className="rounded-full bg-surface-card px-2 py-0.5 text-[9px] font-semibold text-content-primary sm:text-[10px]">
                                    Hoje
                                  </span>
                                ) : null}
                              </div>

                              <div className="grid gap-1">
                                {cell.holidays.slice(0, 2).map((holiday) => {
                                  const meta = HOLIDAY_TYPE_META[holiday.type]

                                  return (
                                    <div
                                      key={holiday.id}
                                      className={`flex min-w-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold sm:text-[11px] ${meta.badgeClassName}`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`size-2 shrink-0 rounded-full ${meta.dotClassName}`}
                                      />

                                      <span className="min-w-0 truncate">
                                        {holiday.name}
                                      </span>
                                    </div>
                                  )
                                })}

                                {cell.holidays.length > 2 ? (
                                  <Typography
                                    variant="legal"
                                    value={`+${cell.holidays.length - 2} feriado(s)`}
                                    className="text-content-muted"
                                  />
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </article>

                  <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <Typography
                          variant="h4"
                          value="Feriados do mês"
                          className="text-xl font-semibold"
                        />

                        <Typography
                          variant="legal"
                          value="Lista resumida com data, tipo e escopo."
                          className="text-content-muted"
                        />
                      </div>

                      <Typography
                        variant="legal"
                        value={`${monthHolidays.length} encontrado(s)`}
                        className="rounded-full bg-surface-page px-3 py-1 text-content-muted"
                      />
                    </div>

                    {monthHolidays.length > 0 ? (
                      <div className="grid gap-3">
                        {monthHolidays.map((holiday) => {
                          const meta = HOLIDAY_TYPE_META[holiday.type]

                          return (
                            <article
                              key={holiday.id}
                              className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-page p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="grid gap-1">
                                  <Typography
                                    variant="b2"
                                    value={holiday.name}
                                    className="font-semibold"
                                  />

                                  <Typography
                                    variant="legal"
                                    value={formatHolidayDate(holiday.date)}
                                    className="text-content-muted"
                                  />
                                </div>

                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${meta.badgeClassName}`}
                                >
                                  {meta.label}
                                </span>
                              </div>

                              <Typography
                                variant="legal"
                                value={formatHolidayCompanies(holiday)}
                                className="text-content-muted"
                              />
                            </article>
                          )
                        })}
                      </div>
                    ) : (
                      <CalendarEmptyState />
                    )}
                  </article>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function SummaryCard({
  label,
  value,
  subtitle,
}: {
  label: string
  value: number
  subtitle: string
}) {
  return (
    <article className="grid gap-2 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <Typography
        variant="legal"
        value={label}
        className="text-content-muted"
      />

      <Typography variant="h4" value={String(value)} className="text-2xl" />

      <Typography
        variant="legal"
        value={subtitle}
        className="text-content-muted"
      />
    </article>
  )
}

function CalendarEmptyState() {
  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface-page px-4 py-5 text-center">
      <Typography
        variant="b2"
        value="Nenhum feriado encontrado"
        className="font-semibold"
      />

      <Typography
        variant="legal"
        value="A combinação atual de empresa e período não possui feriados ativos."
        className="text-content-muted"
      />
    </div>
  )
}

function CalendarCompaniesEmptyState() {
  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface-page px-4 py-5 text-center">
      <Typography
        variant="b2"
        value="Nenhuma empresa disponível"
        className="font-semibold"
      />

      <Typography
        variant="legal"
        value="Não encontramos empresas para montar o calendário."
        className="text-content-muted"
      />
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
      <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="grid gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <div className="grid min-w-[640px] grid-cols-7 gap-1.5 sm:min-w-0 sm:gap-2">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={`weekday-${index}`} className="h-10 rounded-xl" />
            ))}

            {Array.from({ length: 42 }, (_, index) => (
              <Skeleton key={`cell-${index}`} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </article>

      <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="grid gap-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`holiday-skeleton-${index}`}
              className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-page p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
