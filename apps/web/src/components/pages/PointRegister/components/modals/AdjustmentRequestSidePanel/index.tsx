// External Libraries
import { forwardRef, useImperativeHandle } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { TextArea } from "@/components/structure/TextArea"

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
      title="Solicitacao de ajuste"
      subtitle="Solicite o ajuste dos horarios necessarios"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="grid gap-4">
            <Table
              data={tableRows}
              allowActions
              minWidth="360px"
              sideScroll={false}
              actions={ADJUSTMENT_ACTIONS}
              getRowKey={getTableRowKey}
              className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card"
              onActionClick={handleTableActionClick}
              onCellChange={handleTableCellChange}
            />

            <Button
              variant="text"
              icon="plus"
              iconPlacement="start"
              color="primary"
              value="Adicionar registro"
              disabled={isSubmitting}
              onClick={handleAddRecord}
            />

            <TextArea
              label="Justificativa"
              value={form.justification}
              onChange={handleJustificationChange}
            />
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
          <Button
            fitWidth
            value="Cancelar"
            color="danger"
            variant="outlined"
            disabled={isSubmitting}
            onClick={handleCancel}
          />

          <Button
            fitWidth
            value="Salvar"
            loading={isSubmitting}
            onClick={handleConfirm}
          />
        </footer>
      </div>
    </SidePanel>
  )
})

AdjustmentRequestSidePanel.displayName = "AdjustmentRequestSidePanel"
