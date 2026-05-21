// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"
import { useToastContext } from "@/contexts/ToastContext"
import { useHolidaysContext } from "../../contexts/HolidaysContext"

// Types
import type { TableRowData } from "@/components/structure/Table/types"
import type { HolidayDrawerMethods } from "../../components/HolidayDrawer/types"
import type { Holiday } from "../../types"

// Utils
import { buildTableData } from "./utils"

export function useHolidays() {
  // Refs
  const drawerRef = useRef<HolidayDrawerMethods>(null)

  // States
  const [selectedElement, setSelectedElement] = useState<Holiday | null>(null)
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)
  const [pendingRemovalId, setPendingRemovalId] = useState<number | null>(null)

  // Constants
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const { holidays, isLoading, removeHoliday } = useHolidaysContext()
  const tableData = useMemo(() => buildTableData(holidays), [holidays])

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function getHolidayByRow(row: TableRowData) {
    const rowIndex = tableData.indexOf(row)
    return holidays[rowIndex]
  }

  function getRowKey(_: TableRowData, index: number) {
    return holidays[index]?.id ?? index
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

  return {
    drawerRef,
    isLoading,
    selectedElement,
    tableData,
    getRowKey,
    getActionState,
    handleActionClick,
    handleAddClick,
    handleRowSelect,
  }
}
