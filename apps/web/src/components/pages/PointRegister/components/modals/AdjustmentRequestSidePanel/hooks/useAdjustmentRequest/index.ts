// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"

// Constants
import { POINT_TYPES } from "../../constants"

// Services
import { createAdjustmentRequest } from "@/services/domain"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import { getErrorMessage } from "@/utils/getErrorMessage"
import type { PointRecord } from "../../../../../types"
import { AdjustmentRequestForm, UseAdjustmentRequestParams } from "./types"

export function useAdjustmentRequest({
  onSubmitted,
  records,
  workdayDate,
}: UseAdjustmentRequestParams) {
  // Refs
  const sidePanelRef = useRef<SidePanelMethods>(null)

  // States
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<AdjustmentRequestForm>(makeInitialForm)

  // Contexts
  const { showToast } = useToastContext()

  // Effects
  useEffect(() => {
    if (!records.length) return

    setForm(buildCurrentForm(records))

    setErrorMessage("")
  }, [records])

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
      value: normalizeEditableTime(record.time),
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
          workdayDate: workdayDate ?? records[0]?.workdayDate,
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
    setForm(makeInitialForm())
    sidePanelRef.current?.close()
  }

  async function handleConfirm() {
    const effectiveWorkdayDate =
      workdayDate ?? records[0]?.workdayDate ?? form.records[0]?.workdayDate

    const normalizedWorkdayDate = effectiveWorkdayDate
      ? normalizeWorkdayDate(effectiveWorkdayDate)
      : ""

    if (isSubmitting || !effectiveWorkdayDate) return

    if (!form.justification.trim()) {
      setErrorMessage("Informe uma justificativa para continuar.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const adjustmentRecords = buildAdjustmentRecords(records, form.records)

      if (adjustmentRecords.length === 0) {
        setErrorMessage(
          "Altere ao menos um horario antes de solicitar o ajuste."
        )
        return
      }

      if (!normalizedWorkdayDate) {
        setErrorMessage("Informe um horario valido para continuar.")
        return
      }

      await createAdjustmentRequest({
        workdayDate: normalizedWorkdayDate,
        justification: form.justification.trim(),
        records: adjustmentRecords,
      })

      await onSubmitted?.()

      showToast({
        variant: "success",
        message: "Solicitacao de ajuste enviada com sucesso.",
      })

      sidePanelRef.current?.close()
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel enviar a solicitacao de ajuste."
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    sidePanelRef.current?.close()
  }

  function handleOpen() {
    setErrorMessage("")
    setForm(buildCurrentForm(records))
    sidePanelRef.current?.open()
  }

  function handleToggle() {
    sidePanelRef.current?.toggle()
  }

  function handleJustificationChange(value: string) {
    setErrorMessage("")

    setForm((currentForm) => ({ ...currentForm, justification: value }))
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

function makeInitialForm(): AdjustmentRequestForm {
  return {
    justification: "",
    records: [],
  }
}

function buildCurrentForm(records: PointRecord[]) {
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

function buildAdjustmentRecords(
  initialRecords: PointRecord[],
  currentRecords: PointRecord[]
) {
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
      newRecordedAt: makeDateTime(
        currentRecord.workdayDate,
        currentRecord.time
      ),
    })
  }

  return nextRecords
}

function normalizeEditableTime(time: string) {
  const [hours = "00", minutes = "00"] = time.trim().split(":")
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
}

function makeDateTime(date: string, time: string) {
  const [rawHours = "", rawMinutes = ""] = time.trim().split(":")
  const hours = rawHours.padStart(2, "0")
  const minutes = rawMinutes.padStart(2, "0")
  const normalizedDate = normalizeWorkdayDate(date)

  if (!/^\d{2}$/.test(hours) || !/^\d{2}$/.test(minutes)) {
    throw new Error("Informe um horario valido para continuar.")
  }

  if (!normalizedDate) {
    throw new Error("Informe um horario valido para continuar.")
  }

  const parsedDate = new Date(`${normalizedDate}T${hours}:${minutes}:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Informe um horario valido para continuar.")
  }

  return parsedDate.toISOString()
}

function normalizeWorkdayDate(date: string) {
  const matchedDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0]

  if (matchedDate) {
    return matchedDate
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ""
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
  const day = String(parsedDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
