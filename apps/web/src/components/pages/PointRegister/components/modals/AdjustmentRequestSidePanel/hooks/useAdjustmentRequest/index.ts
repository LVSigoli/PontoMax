// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"

// Services
import { createAdjustmentRequest } from "@/services/domain"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import { getErrorMessage } from "@/utils/getErrorMessage"
import type { PointRecord } from "../../../../../types"
import { AdjustmentRequestForm, UseAdjustmentRequestParams } from "./types"
import {
  buildAdjustmentRecords,
  buildCurrentForm,
  buildNewRecord,
  buildTableRows,
  createPointTypeOptions,
  makeInitialForm,
  normalizeWorkdayDate,
  resolveWorkdayDate,
} from "./utils"

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

  // Constans
  const pointTypeOptions = useMemo<SelectionOption[]>(createPointTypeOptions, [])
  const tableRows = useMemo<TableRowData[]>(
    () => buildTableRows(form.records, pointTypeOptions),
    [form.records, pointTypeOptions]
  )

  function handleAddRecord() {
    setErrorMessage("")
    setForm((currentForm) => ({
      ...currentForm,
      records: [...currentForm.records, buildNewRecord(currentForm.records, workdayDate, records)],
    }))
  }

  function handleCancel() {
    setErrorMessage("")
    setForm(makeInitialForm())
    sidePanelRef.current?.close()
  }

  async function handleConfirm() {
    const effectiveWorkdayDate = resolveWorkdayDate(
      workdayDate,
      records,
      form.records
    )
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
