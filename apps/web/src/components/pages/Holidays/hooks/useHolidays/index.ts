// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"
import { useToastContext } from "@/contexts/ToastContext"
import { useCompaniesSWR } from "@/hooks/swr"
import { useHolidaysContext } from "../../contexts/HolidaysContext"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { HolidayDrawerMethods } from "../../components/HolidayDrawer/types"
import type { Holiday } from "../../types"

// Utils
import { buildTableData } from "./utils"

const ALL_OPTION_VALUE = "__all__"

export function useHolidays() {
  // Refs
  const drawerRef = useRef<HolidayDrawerMethods>(null)

  // States
  const [selectedElement, setSelectedElement] = useState<Holiday | null>(null)
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)
  const [pendingRemovalId, setPendingRemovalId] = useState<number | null>(null)
  const [selectedYearValue, setSelectedYearValue] = useState(() =>
    String(new Date().getFullYear())
  )
  const [selectedTypeValue, setSelectedTypeValue] = useState(ALL_OPTION_VALUE)
  const [selectedCompanyValue, setSelectedCompanyValue] =
    useState(ALL_OPTION_VALUE)

  // Constants
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const { holidays, isLoading, removeHoliday } = useHolidaysContext()
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const {
    data: companyItems = [],
    isLoading: isCompaniesLoading,
  } = useCompaniesSWR({ enabled: isPlatformAdmin })

  const yearOptions = useMemo<SelectionOption[]>(() => {
    const availableYears = new Set<string>([String(new Date().getFullYear())])

    holidays.forEach((holiday) => {
      availableYears.add(holiday.date.slice(0, 4))
    })

    return [...availableYears]
      .sort((left, right) => Number(right) - Number(left))
      .map((year) => ({
        value: year,
        label: year,
      }))
  }, [holidays])
  const typeOptions = useMemo<SelectionOption[]>(
    () => [
      { value: ALL_OPTION_VALUE, label: "Todos os tipos" },
      { value: "Nacional", label: "Nacional" },
      { value: "Municipal", label: "Municipal" },
      { value: "Estadual", label: "Estadual" },
      { value: "Empresa", label: "Empresa" },
    ],
    []
  )
  const companyOptions = useMemo<SelectionOption[]>(
    () => [
      { value: ALL_OPTION_VALUE, label: "Todas as empresas" },
      ...companyItems.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    ],
    [companyItems]
  )
  const filteredHolidays = useMemo(() => {
    const selectedCompanyId =
      selectedCompanyValue === ALL_OPTION_VALUE
        ? undefined
        : Number(selectedCompanyValue)

    return holidays.filter((holiday) => {
      const matchesYear = holiday.date.startsWith(selectedYearValue)
      const matchesType =
        selectedTypeValue === ALL_OPTION_VALUE ||
        holiday.type === selectedTypeValue
      const matchesCompany =
        selectedCompanyId === undefined ||
        holiday.type === "Nacional" ||
        holiday.companyIds.includes(selectedCompanyId)

      return matchesYear && matchesType && matchesCompany
    })
  }, [holidays, selectedCompanyValue, selectedTypeValue, selectedYearValue])
  const tableData = useMemo(
    () => buildTableData(filteredHolidays),
    [filteredHolidays]
  )
  const selectedYearOption = useMemo(
    () => yearOptions.filter((option) => option.value === selectedYearValue),
    [selectedYearValue, yearOptions]
  )
  const selectedTypeOption = useMemo(
    () => typeOptions.filter((option) => option.value === selectedTypeValue),
    [selectedTypeValue, typeOptions]
  )
  const selectedCompanyOption = useMemo(
    () =>
      companyOptions.filter((option) => option.value === selectedCompanyValue),
    [companyOptions, selectedCompanyValue]
  )
  const resultLabel = `${filteredHolidays.length} feriado(s) encontrado(s)`

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function getHolidayByRow(row: TableRowData) {
    const rowIndex = tableData.indexOf(row)
    return filteredHolidays[rowIndex]
  }

  function getRowKey(_: TableRowData, index: number) {
    return filteredHolidays[index]?.id ?? index
  }

  async function handleActionClick(actionId: string, row: TableRowData) {
    const holiday = getHolidayByRow(row)
    if (!holiday) return
    if (!canManageHoliday(holiday)) return

    if (actionId === "remove") {
      setPendingRemovalId(holiday.id)

      try {
        await removeHoliday(holiday.id)
      } finally {
        setPendingRemovalId((currentId) =>
          currentId === holiday.id ? null : currentId
        )
      }

      return
    }

    if (actionId === "edit") openDrawer(holiday)
  }

  function handleAddClick() {
    openDrawer(null)
  }

  function handleRowSelect(row: TableRowData) {
    const holiday = getHolidayByRow(row)

    if (!holiday) return
    if (!canManageHoliday(holiday)) return

    openDrawer(holiday)
  }

  function openDrawer(holiday: Holiday | null) {
    setSelectedElement(holiday)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  function canManageHoliday(holiday: Holiday) {
    if (holiday.type !== "Nacional" || user?.role === "PLATFORM_ADMIN") {
      return true
    }

    showToast({
      variant: "warning",
      message: "Somente administradores da plataforma podem gerenciar feriados nacionais.",
    })

    return false
  }

  function getActionState(actionId: string, row: TableRowData) {
    const holiday = getHolidayByRow(row)

    if (!holiday || pendingRemovalId !== holiday.id) {
      return undefined
    }

    return {
      disabled: true,
      loading: actionId === "remove",
    }
  }

  function handleYearChange(selection: SelectionOption[]) {
    const nextYear = selection[0]?.value

    if (!nextYear) return

    setSelectedYearValue(nextYear)
  }

  function handleTypeChange(selection: SelectionOption[]) {
    const nextType = selection[0]?.value

    if (!nextType) return

    setSelectedTypeValue(nextType)
  }

  function handleCompanyChange(selection: SelectionOption[]) {
    const nextCompany = selection[0]?.value

    if (!nextCompany) return

    setSelectedCompanyValue(nextCompany)
  }

  return {
    companyOptions,
    drawerRef,
    isLoading,
    isCompaniesLoading,
    isPlatformAdmin,
    resultLabel,
    selectedElement,
    selectedCompanyOption,
    selectedTypeOption,
    selectedYearOption,
    tableData,
    typeOptions,
    yearOptions,
    getRowKey,
    getActionState,
    handleActionClick,
    handleAddClick,
    handleCompanyChange,
    handleRowSelect,
    handleTypeChange,
    handleYearChange,
  }
}
