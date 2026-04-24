// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Constants
import { MANAGEMENT_TABS } from "../../constants"

// Utils
import { useManagementContext } from "../../contexts/ManagementContext"
import { formatTimeLabel, getCompanyName, getJourneyName } from "../../utils"

// Types
import type { TableRowData } from "@/components/structure/Table/types"
import type { ManagementDrawerMethods } from "../../components/ManagementDrawer/types"
import type {
  Company,
  Employee,
  Journey,
  ManagementEntity,
  ManagementTabId,
  ManagementTabOption,
} from "../../types"

export function useManagement() {
  // Refs
  const drawerRef = useRef<ManagementDrawerMethods>(null)

  // States
  const [activeTab, setActiveTab] = useState<ManagementTabOption>(
    MANAGEMENT_TABS[0]
  )
  const [selectedElement, setSelectedElement] =
    useState<ManagementEntity | null>(null)
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)

  // Constants
  const { companies, employees, journeys, removeEntity } =
    useManagementContext()
  const activeItems = getActiveItems()
  const tableData = useMemo(
    () => makeTableData(activeTab.id, companies, employees, journeys),
    [activeTab.id, companies, employees, journeys]
  )

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function getActiveItems(): ManagementEntity[] {
    if (activeTab.id === "companies") return companies
    if (activeTab.id === "employees") return employees

    return journeys
  }

  function getRowEntity(row: TableRowData) {
    const rowIndex = tableData.indexOf(row)
    return activeItems[rowIndex]
  }

  function getRowKey(_: TableRowData, index: number) {
    return activeItems[index]?.id ?? index
  }

  function handleActionClick(actionId: string, row: TableRowData) {
    const entity = getRowEntity(row)
    if (!entity) return

    if (actionId === "remove") {
      removeEntity(activeTab.id, entity.id)
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
    setSelectedElement(null)
  }

  return {
    activeTab,
    drawerRef,
    selectedElement,
    tableData,
    handleActionClick,
    handleAddClick,
    handleRowSelect,
    handleTabChange,
    getRowKey,
  }
}

function makeTableData(
  tab: ManagementTabId,
  companies: Company[],
  employees: Employee[],
  journeys: Journey[]
) {
  if (tab === "companies") {
    return companies.map<TableRowData>((company) => ({
      Empresa: { value: company.name },
      CNPJ: { value: company.cnpj },
      Funcionarios: {
        value: company.employees,
        type: "badge",
        color: "bg-success-50 text-success-700",
      },
    }))
  }

  if (tab === "employees") {
    return employees.map<TableRowData>((employee) => ({
      Nome: { value: employee.name },
      Email: { value: employee.email },
      Cargo: { value: employee.role },
      Empresa: { value: getCompanyName(companies, employee.companyId) },
      Jornada: { value: getJourneyName(journeys, employee.journeyId) },
    }))
  }

  return journeys.map<TableRowData>((journey) => ({
    Nome: { value: journey.name },
    Entrada: { value: formatTimeLabel(journey.startTime) },
    Saida: { value: formatTimeLabel(journey.endTime) },
    Intervalo: { value: formatTimeLabel(journey.interval) },
    Escala: { value: journey.scale },
    Funcionarios: {
      value: journey.employees,
      type: "badge",
      color: "bg-success-50 text-success-700",
    },
  }))
}
