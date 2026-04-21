// External Libraries
import { useMemo, useRef, useState } from "react"

// Constants
import { POINT_TYPES } from "../../constants"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { PointRecord } from "../../../../../types"

interface UseAdjustmentRequestParams {
  records: PointRecord[]
}

interface AdjustmentRequestForm {
  justification: string
  records: PointRecord[]
}

export function useAdjustmentRequest({ records }: UseAdjustmentRequestParams) {
  // Refs
  const sidePanelRef = useRef<SidePanelMethods>(null)

  // States
  const [form, setForm] = useState<AdjustmentRequestForm>(() =>
    makeInitialForm(records)
  )

  // Constants
  const pointTypeOptions = useMemo<SelectionOption[]>(
    () =>
      POINT_TYPES.map((type) => ({
        value: type,
        label: type,
      })),
    []
  )

  const tableRows = form.records.map<TableRowData>((record) => ({
    Horario: {
      type: "time-picker",
      value: record.time.slice(0, 5),
      className: "w-24",
    },
    Tipo: {
      type: "select",
      value: record.type,
      options: pointTypeOptions,
      className: "w-32",
      color: record.type === "Entrada" ? "text-success-700" : "text-danger-700",
    },
  }))

  // Functions
  function handleAddRecord() {
    setForm((currentForm) => ({
      ...currentForm,
      records: [
        ...currentForm.records,
        {
          id: Date.now(),
          time: "08:00:00",
          workedHours: "00h 00min",
          extraHours: "00h 00min",
          missingHours: "00h 00min",
          type: getNextPointType(currentForm.records),
          status: "Registrado",
        } satisfies PointRecord,
      ],
    }))
  }

  function handleCancel() {
    setForm(makeInitialForm(records))
    sidePanelRef.current?.close()
  }

  function handleConfirm() {
    console.log("adjustment request", form)
    sidePanelRef.current?.close()
  }

  function handleClose() {
    sidePanelRef.current?.close()
  }

  function handleOpen() {
    setForm(makeInitialForm(records))
    sidePanelRef.current?.open()
  }

  function handleToggle() {
    sidePanelRef.current?.toggle()
  }

  function handleJustificationChange(value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      justification: value,
    }))
  }

  function getTableRowKey(_: TableRowData, index: number) {
    return form.records[index]?.id ?? index
  }

  function handleRecordRemove(id: number) {
    setForm((currentForm) => ({
      ...currentForm,
      records: currentForm.records.filter((record) => record.id !== id),
    }))
  }

  function handleRecordTimeChange(id: number, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      records: currentForm.records.map((record) =>
        record.id === id ? { ...record, time: `${value}:00` } : record
      ),
    }))
  }

  function handleRecordTypeChange(id: number, value: PointRecord["type"]) {
    setForm((currentForm) => ({
      ...currentForm,
      records: currentForm.records.map((record) =>
        record.id === id ? { ...record, type: value } : record
      ),
    }))
  }

  function handleTableActionClick(actionId: string, item: TableRowData) {
    const recordIndex = tableRows.indexOf(item)
    const record = form.records[recordIndex]

    if (actionId === "remove" && record) handleRecordRemove(record.id)
  }

  function handleTableCellChange(
    item: TableRowData,
    cellKey: keyof TableRowData,
    value: string
  ) {
    const recordIndex = tableRows.indexOf(item)
    const record = form.records[recordIndex]

    if (!record) return

    if (cellKey === "Horario") handleRecordTimeChange(record.id, value)
    if (cellKey === "Tipo") {
      handleRecordTypeChange(record.id, value as PointRecord["type"])
    }
  }

  return {
    form,
    sidePanelRef,
    tableRows,
    handleAddRecord,
    handleCancel,
    handleClose,
    handleConfirm,
    handleJustificationChange,
    handleOpen,
    getTableRowKey,
    handleTableActionClick,
    handleTableCellChange,
    handleToggle,
  }
}

function makeInitialForm(records: PointRecord[]): AdjustmentRequestForm {
  return {
    justification: "",
    records: records.map((record) => ({ ...record })),
  }
}

function getNextPointType(records: PointRecord[]) {
  return records[records.length - 1]?.type === POINT_TYPES[0]
    ? POINT_TYPES[1]
    : POINT_TYPES[0]
}
