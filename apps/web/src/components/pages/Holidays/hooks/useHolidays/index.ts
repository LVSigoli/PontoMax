// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useHolidaysContext } from "../../contexts/HolidaysContext"

// Types
import type { TableRowData } from "@/components/structure/Table/types"
import type { Holiday } from "../../types"
import type { HolidayDrawerMethods } from "../../components/HolidayDrawer/types"

// Utils
import { formatHolidayDate, getHolidayStatusClass } from "../../utils"

export function useHolidays() {
  // Refs
  const drawerRef = useRef<HolidayDrawerMethods>(null)

  // States
  const [selectedElement, setSelectedElement] = useState<Holiday | null>(null)
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)

  // Constants
  const { holidays, removeHoliday } = useHolidaysContext()
  const tableData = useMemo(
    () =>
      holidays.map<TableRowData>((holiday) => ({
        "Nome do feriado": { value: holiday.name },
        Data: { value: formatHolidayDate(holiday.date) },
        Tipo: { value: holiday.type },
        Status: {
          value: holiday.status,
          type: "badge",
          color: getHolidayStatusClass(holiday.status),
        },
      })),
    [holidays]
  )

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

  function handleActionClick(actionId: string, row: TableRowData) {
    const holiday = getHolidayByRow(row)
    if (!holiday) return

    if (actionId === "remove") {
      removeHoliday(holiday.id)
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

    openDrawer(holiday)
  }

  function openDrawer(holiday: Holiday | null) {
    setSelectedElement(holiday)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  return {
    drawerRef,
    selectedElement,
    tableData,
    getRowKey,
    handleActionClick,
    handleAddClick,
    handleRowSelect,
  }
}
