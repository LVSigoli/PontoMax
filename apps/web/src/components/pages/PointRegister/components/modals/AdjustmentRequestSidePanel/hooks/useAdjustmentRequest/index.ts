// External Libraries
import { useMemo, useRef, useState } from "react"

// Constants
import { POINT_TYPES } from "../../constants"

// Services
import { createAdjustmentRequest } from "@/services/domain"
import { getErrorMessage } from "@/services/utils"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { PointRecord } from "../../../../../types"

interface UseAdjustmentRequestParams {
  records: PointRecord[]
  onSubmitted?: () => Promise<void> | void
}

interface AdjustmentRequestForm {
  justification: string
  records: PointRecord[]
}

export function useAdjustmentRequest({
  onSubmitted,
  records,
}: UseAdjustmentRequestParams) {
  const sidePanelRef = useRef<SidePanelMethods>(null)

  const [form, setForm] = useState<AdjustmentRequestForm>(() =>
    makeInitialForm(records)
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  function handleAddRecord() {
    setErrorMessage("")
    setForm((currentForm) => ({
      ...currentForm,
      records: [
        ...currentForm.records,
        {
          id: Date.now(),
          workdayDate: records[0]?.workdayDate,
          time: "08:00",
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
    setErrorMessage("")
    setForm(makeInitialForm(records))
    sidePanelRef.current?.close()
  }

  async function handleConfirm() {
    const workdayDate = records[0]?.workdayDate

    if (isSubmitting || !workdayDate) {
      return
    }

    if (!form.justification.trim()) {
      setErrorMessage("Informe uma justificativa para continuar.")
      return
    }

    const adjustmentRecords = buildAdjustmentRecords(records, form.records)

    if (adjustmentRecords.length === 0) {
      setErrorMessage("Altere ao menos um horario antes de solicitar o ajuste.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      await createAdjustmentRequest({
        workdayDate,
        justification: form.justification.trim(),
        records: adjustmentRecords,
      })

      await onSubmitted?.()
      sidePanelRef.current?.close()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel enviar a solicitacao de ajuste.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    sidePanelRef.current?.close()
  }

  function handleOpen() {
    setErrorMessage("")
    setForm(makeInitialForm(records))
    sidePanelRef.current?.open()
  }

  function handleToggle() {
    sidePanelRef.current?.toggle()
  }

  function handleJustificationChange(value: string) {
    setErrorMessage("")
    setForm((currentForm) => ({
      ...currentForm,
      justification: value,
    }))
  }

  function getTableRowKey(_: TableRowData, index: number) {
    return form.records[index]?.id ?? index
  }

  function handleRecordRemove(id: number) {
    setErrorMessage("")
    setForm((currentForm) => ({
      ...currentForm,
      records: currentForm.records.filter((record) => record.id !== id),
    }))
  }

  function handleRecordTimeChange(id: number, value: string) {
    setErrorMessage("")
    setForm((currentForm) => ({
      ...currentForm,
      records: currentForm.records.map((record) =>
        record.id === id ? { ...record, time: value } : record
      ),
    }))
  }

  function handleRecordTypeChange(id: number, value: PointRecord["type"]) {
    setErrorMessage("")
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
    errorMessage,
    isSubmitting,
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

function buildAdjustmentRecords(initialRecords: PointRecord[], currentRecords: PointRecord[]) {
  const nextRecords: Array<{
    timeEntryId?: number
    actionType: "CREATE" | "UPDATE" | "DELETE"
    targetKind: "ENTRY" | "EXIT"
    originalRecordedAt?: string
    newRecordedAt?: string
  }> = []

  const currentByEntryId = new Map(
    currentRecords
      .filter((record) => record.timeEntryId)
      .map((record) => [record.timeEntryId, record])
  )

  for (const initialRecord of initialRecords) {
    if (!initialRecord.timeEntryId || !initialRecord.workdayDate) {
      continue
    }

    const currentRecord = currentByEntryId.get(initialRecord.timeEntryId)

    if (!currentRecord) {
      nextRecords.push({
        timeEntryId: initialRecord.timeEntryId,
        actionType: "DELETE",
        targetKind: initialRecord.type === "Entrada" ? "ENTRY" : "EXIT",
        originalRecordedAt: initialRecord.recordedAt,
      })
      continue
    }

    const nextRecordedAt = makeDateTime(
      initialRecord.workdayDate,
      currentRecord.time
    )
    const nextKind = currentRecord.type === "Entrada" ? "ENTRY" : "EXIT"

    if (
      nextRecordedAt !== initialRecord.recordedAt ||
      nextKind !== (initialRecord.type === "Entrada" ? "ENTRY" : "EXIT")
    ) {
      nextRecords.push({
        timeEntryId: initialRecord.timeEntryId,
        actionType: "UPDATE",
        targetKind: nextKind,
        originalRecordedAt: initialRecord.recordedAt,
        newRecordedAt: nextRecordedAt,
      })
    }
  }

  for (const currentRecord of currentRecords) {
    if (currentRecord.timeEntryId || !currentRecord.workdayDate) {
      continue
    }

    nextRecords.push({
      actionType: "CREATE",
      targetKind: currentRecord.type === "Entrada" ? "ENTRY" : "EXIT",
      newRecordedAt: makeDateTime(currentRecord.workdayDate, currentRecord.time),
    })
  }

  return nextRecords
}

function makeDateTime(date: string, time: string) {
  const normalizedTime = time.length >= 5 ? time.slice(0, 5) : `${time}:00`
  return new Date(`${date}T${normalizedTime}:00`).toISOString()
}
