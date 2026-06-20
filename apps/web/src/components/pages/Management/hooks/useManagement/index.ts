// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"

// Constants
import { MANAGEMENT_TABS } from "../../constants"

// Utils
import { useManagementContext } from "../../contexts/ManagementContext"
import { makeTableData } from "./utils"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { ManagementDrawerMethods } from "../../components/ManagementDrawer/types"
import type { ManagementEntity, ManagementTabOption } from "../../types"
import {
  ALL_OPTION_VALUE,
  buildRemovalKey,
  matchesCompanySearch,
  matchesEmployeeSearch,
  matchesJourneySearch,
} from "./filters"

export function useManagement() {
  // Refs
  const drawerRef = useRef<ManagementDrawerMethods>(null)

  const { user } = useAuth()

  // States
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)
  const availableTabs = useMemo(
    () =>
      user?.role === "PLATFORM_ADMIN"
        ? MANAGEMENT_TABS
        : MANAGEMENT_TABS.filter((tab) => tab.id !== "companies"),
    [user?.role]
  )
  const [activeTab, setActiveTab] = useState<ManagementTabOption>(
    availableTabs[0] ?? MANAGEMENT_TABS[0]
  )
  const [search, setSearch] = useState("")
  const [selectedCompanyValue, setSelectedCompanyValue] =
    useState(ALL_OPTION_VALUE)
  const [selectedRoleValue, setSelectedRoleValue] = useState(ALL_OPTION_VALUE)
  const [selectedElement, setSelectedElement] =
    useState<ManagementEntity | null>(null)
  const [pendingRemovalKey, setPendingRemovalKey] = useState<string | null>(
    null
  )

  // Hooks
  const { companies, employees, journeys, isLoading, removeEntity } =
    useManagementContext()

  // Constants
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const companyOptions = useMemo<SelectionOption[]>(() => {
    return [
      { value: ALL_OPTION_VALUE, label: "Todas as empresas" },
      ...companies.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    ]
  }, [companies])
  const roleOptions = useMemo<SelectionOption[]>(() => {
    const availableRoles = new Set<string>()

    employees.forEach((employee) => {
      const value = employee.role.trim()

      if (value) {
        availableRoles.add(value)
      }
    })

    return [
      { value: ALL_OPTION_VALUE, label: "Todos os cargos" },
      ...[...availableRoles]
        .sort((left, right) => left.localeCompare(right, "pt-BR"))
        .map((role) => ({
          value: role,
          label: role,
        })),
    ]
  }, [employees])
  const selectedCompanyOption = useMemo(
    () =>
      companyOptions.filter((option) => option.value === selectedCompanyValue),
    [companyOptions, selectedCompanyValue]
  )
  const selectedRoleOption = useMemo(
    () => roleOptions.filter((option) => option.value === selectedRoleValue),
    [roleOptions, selectedRoleValue]
  )
  const showCompanyFilter =
    isPlatformAdmin &&
    (activeTab.id === "employees" || activeTab.id === "journeys")
  const showRoleFilter = activeTab.id === "employees"
  const filteredCompanies = useMemo(
    () => companies.filter((company) => matchesCompanySearch(company, search)),
    [companies, search]
  )
  const filteredEmployees = useMemo(() => {
    const selectedCompanyId =
      selectedCompanyValue === ALL_OPTION_VALUE
        ? undefined
        : Number(selectedCompanyValue)

    return employees.filter((employee) => {
      const matchesSearch = matchesEmployeeSearch({
        companies,
        employee,
        journeys,
        search,
      })
      const matchesCompany =
        selectedCompanyId === undefined ||
        employee.companyId === selectedCompanyId
      const matchesRole =
        selectedRoleValue === ALL_OPTION_VALUE ||
        employee.role === selectedRoleValue

      return matchesSearch && matchesCompany && matchesRole
    })
  }, [
    companies,
    employees,
    journeys,
    search,
    selectedCompanyValue,
    selectedRoleValue,
  ])
  const filteredJourneys = useMemo(() => {
    const selectedCompanyId =
      selectedCompanyValue === ALL_OPTION_VALUE
        ? undefined
        : Number(selectedCompanyValue)

    return journeys.filter((journey) => {
      const matchesSearch = matchesJourneySearch(journey, search)
      const matchesCompany =
        selectedCompanyId === undefined ||
        journey.companyId === selectedCompanyId

      return matchesSearch && matchesCompany
    })
  }, [journeys, search, selectedCompanyValue])
  const activeItems = useMemo(() => {
    if (activeTab.id === "companies") return filteredCompanies
    if (activeTab.id === "employees") return filteredEmployees

    return filteredJourneys
  }, [activeTab.id, filteredCompanies, filteredEmployees, filteredJourneys])
  const tableData = useMemo(
    () => buildTableData(),
    [
      activeTab.id,
      filteredCompanies,
      filteredEmployees,
      filteredJourneys,
      companies,
      journeys,
    ]
  )
  const resultLabel = `${activeItems.length} registro(s) encontrado(s)`

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function buildTableData() {
    const params = {
      tab: activeTab.id,
      companies: activeTab.id === "companies" ? filteredCompanies : companies,
      employees: filteredEmployees,
      journeys: activeTab.id === "journeys" ? filteredJourneys : journeys,
    }
    return makeTableData(params)
  }

  function getRowEntity(row: TableRowData) {
    const rowIndex = tableData.indexOf(row)
    return activeItems[rowIndex]
  }

  function getRowKey(_: TableRowData, index: number) {
    return activeItems[index]?.id ?? index
  }

  async function handleActionClick(actionId: string, row: TableRowData) {
    const entity = getRowEntity(row)
    if (!entity) return

    if (actionId === "remove") {
      const removalKey = buildRemovalKey(activeTab.id, entity.id)

      setPendingRemovalKey(removalKey)

      try {
        await removeEntity(activeTab.id, entity.id)
      } finally {
        setPendingRemovalKey((currentKey) =>
          currentKey === removalKey ? null : currentKey
        )
      }

      return
    }

    if (actionId === "edit") {
      setSelectedElement(entity)
      setDrawerRequestKey((currentValue) => currentValue + 1)
    }
  }

  function handleAddClick() {
    setSelectedElement(null)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  function handleRowSelect(row: TableRowData) {
    const entity = getRowEntity(row)
    if (!entity) return

    setSelectedElement(entity)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  function handleTabChange(tab: ManagementTabOption) {
    setActiveTab(tab)
    setSearch("")
    setSelectedRoleValue(ALL_OPTION_VALUE)
    setSelectedElement(null)
  }

  function getActionState(actionId: string, row: TableRowData) {
    const entity = getRowEntity(row)

    if (!entity) return undefined

    const isPendingRemoval =
      pendingRemovalKey === buildRemovalKey(activeTab.id, entity.id)

    if (!isPendingRemoval) return undefined

    return {
      disabled: true,
      loading: actionId === "remove",
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
  }

  function handleCompanyChange(selection: SelectionOption[]) {
    const nextCompany = selection[0]?.value

    if (!nextCompany) return

    setSelectedCompanyValue(nextCompany)
  }

  function handleRoleChange(selection: SelectionOption[]) {
    const nextRole = selection[0]?.value

    if (!nextRole) return

    setSelectedRoleValue(nextRole)
  }

  return {
    availableTabs,
    activeTab,
    companyOptions,
    isLoading,
    isPlatformAdmin,
    resultLabel,
    roleOptions,
    search,
    selectedCompanyOption,
    selectedRoleOption,
    showCompanyFilter,
    showRoleFilter,
    tableData,
    drawerRef,
    selectedElement,
    getRowKey,
    getActionState,
    handleAddClick,
    handleCompanyChange,
    handleRoleChange,
    handleRowSelect,
    handleSearchChange,
    handleTabChange,
    handleActionClick,
  }
}
