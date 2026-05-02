// External Libraries
import { forwardRef, useImperativeHandle } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { TextArea } from "@/components/structure/TextArea"
import { Typography } from "@/components/structure/Typography"

// Utils
import { ADJUSTMENT_ACTIONS } from "./constants"

// Hooks
import { useAdjustmentRequest } from "./hooks/useAdjustmentRequest"

// Types
import type {
  AdjustmentRequestSidePanelMethods,
  AdjustmentRequestSidePanelProps,
} from "./types"

export const AdjustmentRequestSidePanel = forwardRef<
  AdjustmentRequestSidePanelMethods,
  AdjustmentRequestSidePanelProps
>(({ records, workdayDate, onSubmitted }, ref) => {
  const {
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
  } = useAdjustmentRequest({ onSubmitted, records, workdayDate })

  useImperativeHandle(
    ref,
    () => ({
      close: handleClose,
      open: handleOpen,
      toggle: handleToggle,
    }),
    [handleClose, handleOpen, handleToggle]
  )

  return (
    <SidePanel
      ref={sidePanelRef}
      className="bg-surface-page "
      widthClassName="max-w-[456px]"
      title="Solicitação de ajuste"
      subtitle="Solicite o ajuste dos horários necessários"
    >
      <div className="flex min-h-full flex-col">
        <Table
          data={tableRows}
          allowActions
          minWidth="360px"
          sideScroll={false}
          actions={ADJUSTMENT_ACTIONS}
          getRowKey={getTableRowKey}
          className="mt-5 overflow-hidden rounded-xl border border-border-subtle bg-surface-card"
          onActionClick={handleTableActionClick}
          onCellChange={handleTableCellChange}
        />

        <Button
          variant="text"
          icon="plus"
          iconPlacement="start"
          color="primary"
          value="Adicionar registro"
          onClick={handleAddRecord}
        />

        <TextArea
          label="Justificativa"
          value={form.justification}
          onChange={handleJustificationChange}
        />

        {errorMessage ? (
          <Typography
            variant="legal"
            value={errorMessage}
            className="mt-3 text-danger-700"
          />
        ) : null}
      </div>

      <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
        <Button
          fitWidth
          value="Cancelar"
          color="danger"
          variant="outlined"
          onClick={handleCancel}
        />

        <Button
          fitWidth
          value="Salvar"
          loading={isSubmitting}
          onClick={handleConfirm}
        />
      </footer>
    </SidePanel>
  )
})

AdjustmentRequestSidePanel.displayName = "AdjustmentRequestSidePanel"
