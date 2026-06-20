import { useEffect, useMemo, useState } from "react"

import type { SelectionOption } from "@/components/structure/Select/types"
import { useAuth } from "@/contexts/AuthContext"
import { useCompaniesSWR, useHolidaysSWR } from "@/hooks/swr"

import type { Holiday } from "../../Holidays/types"
import { mapHolidayApiToHoliday } from "../../Holidays/utils"
import { buildMonthGrid, formatMonthLabel, MONTH_OPTIONS } from "../utils"

export function useHolidayCalendar() {
  const { user } = useAuth()
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
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
    if (companyOptions.some((option) => option.value === selectedCompanyId)) {
      return
    }

    const preferredCompanyId = user?.companyId?.toString()
    const fallbackCompanyId =
      preferredCompanyId &&
      companyOptions.some((option) => option.value === preferredCompanyId)
        ? preferredCompanyId
        : (companyOptions[0]?.value ?? "")

    if (fallbackCompanyId) setSelectedCompanyId(fallbackCompanyId)
  }, [companyOptions, isPlatformAdmin, selectedCompanyId, user?.companyId])

  const canLoadHolidays = !isPlatformAdmin || Boolean(selectedCompanyId)
  const { data: holidayItems = [], isLoading: isHolidaysLoading } =
    useHolidaysSWR(
      {
        companyId:
          isPlatformAdmin && selectedCompanyId
            ? Number(selectedCompanyId)
            : undefined,
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
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(
    2,
    "0"
  )}`
  const monthHolidays = useMemo(
    () => holidays.filter((holiday) => holiday.date.startsWith(monthPrefix)),
    [holidays, monthPrefix]
  )
  const calendarCells = useMemo(
    () => buildMonthGrid(selectedYear, selectedMonth, monthHolidays),
    [monthHolidays, selectedMonth, selectedYear]
  )
  const yearOptions = useMemo<SelectionOption[]>(
    () =>
      Array.from({ length: 11 }, (_, index) => currentYear - 5 + index).map(
        (year) => ({
          value: String(year),
          label: String(year),
        })
      ),
    [currentYear]
  )
  const selectedMonthOption = MONTH_OPTIONS.filter(
    (option) => option.value === String(selectedMonth)
  )
  const selectedYearOption = yearOptions.filter(
    (option) => option.value === String(selectedYear)
  )
  const selectedCompanyOption = companyOptions.filter(
    (option) => option.value === selectedCompanyId
  )
  const selectedCompanyLabel = isPlatformAdmin
    ? (selectedCompanyOption[0]?.label ?? "Selecione uma empresa")
    : user?.companyName?.trim() || "Sua empresa"

  function handleCompanyChange(selection: SelectionOption[]) {
    const value = selection[0]?.value
    if (value) setSelectedCompanyId(value)
  }

  function handleMonthChange(selection: SelectionOption[]) {
    const value = Number(selection[0]?.value)
    if (!Number.isNaN(value)) setSelectedMonth(value)
  }

  function handleYearChange(selection: SelectionOption[]) {
    const value = Number(selection[0]?.value)
    if (!Number.isNaN(value)) setSelectedYear(value)
  }

  function handleResetToToday() {
    const today = new Date()
    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  return {
    calendarCells,
    companyOptions,
    handleCompanyChange,
    handleMonthChange,
    handleResetToToday,
    handleYearChange,
    isCalendarReady: !isPlatformAdmin || Boolean(selectedCompanyId),
    isCompaniesLoading,
    isPlatformAdmin,
    monthHolidays,
    monthLabel: formatMonthLabel(selectedYear, selectedMonth),
    selectedCompanyLabel,
    selectedCompanyOption,
    selectedMonthOption,
    selectedYearOption,
    showLoadingState:
      (isHolidaysLoading && monthHolidays.length === 0) ||
      (isPlatformAdmin && !selectedCompanyId && isCompaniesLoading),
    yearOptions,
  }
}
