// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Constants
import { MANAGEMENT_TABS } from "../../constants"

// Utils
import { useManagementContext } from "../../contexts/ManagementContext"
import { makeTableData } from "./utils"

// Types
import type { TableRowData } from "@/components/structure/Table/types"
import type { InviteModalMethods } from "../../components/InviteModal/types"
import type { ManagementDrawerMethods } from "../../components/ManagementDrawer/types"
import type { ManagementEntity, ManagementTabOption } from "../../types"

export function useManagement() {
  // Refs
  const inviteModalRef = useRef<InviteModalMethods>(null)
  const drawerRef = useRef<ManagementDrawerMethods>(null)

  // States
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)
  const [activeTab, setActiveTab] = useState(MANAGEMENT_TABS[0])
  const [selectedElement, setSelectedElement] =
    useState<ManagementEntity | null>(null)
  const [shouldOpenInviteModal, setShouldOpenInviteModal] = useState(false)

  // Hooks
  const { companies, employees, journeys, invite, removeEntity } =
    useManagementContext()

  // Constants
  const activeItems = getActiveItems()
  const tableData = useMemo(
    () => buildTableData(),
    [activeTab.id, companies, employees, journeys]
  )

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  useEffect(() => {
    if (!shouldOpenInviteModal || !invite.copyText) return

    inviteModalRef.current?.open()
    setShouldOpenInviteModal(false)
  }, [invite.copyText, shouldOpenInviteModal])

  // Functions
  function getActiveItems(): ManagementEntity[] {
    if (activeTab.id === "companies") return companies
    if (activeTab.id === "employees") return employees

    return journeys
  }

  function buildTableData() {
    const params = { tab: activeTab.id, companies, employees, journeys }
    return makeTableData(params)
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

    if (actionId === "remove") return removeEntity(activeTab.id, entity.id)

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

  function handleInviteSuccess() {
    setShouldOpenInviteModal(true)
  }

  return {
    invite,
    activeTab,
    tableData,
    drawerRef,
    inviteModalRef,
    selectedElement,
    getRowKey,
    handleAddClick,
    handleRowSelect,
    handleTabChange,
    handleActionClick,
    handleInviteSuccess,
  }
}
