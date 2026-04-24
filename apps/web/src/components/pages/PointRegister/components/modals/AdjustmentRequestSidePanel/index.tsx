// External Libraries
import { forwardRef, useImperativeHandle } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { TextArea } from "@/components/structure/TextArea"
import { Typography } from "@/components/structure/Typography"

// Assets
import PlusIcon from "@/assets/icons/plus.svg"

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
>(({ records }, ref) => {
  const {
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
  } = useAdjustmentRequest({ records })

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
      widthClassName="max-w-[456px]"
      className="bg-surface-page "
    >
      <div className="flex min-h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-7 sm:px-5">
          <Typography
            variant="h4"
            fontWeight={800}
            className="uppercase tracking-[0.02em]"
            value="Solicitação de ajuste"
          />

          <Typography
            variant="b1"
            value="Solicite o ajuste dos horários necessários"
          />

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
            icon={PlusIcon}
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
        </div>

        <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
          <Button
            fitWidth
            value="Cancelar"
            color="danger"
            variant="outlined"
            onClick={handleCancel}
          />

          <Button fitWidth value="Salvar" onClick={handleConfirm} />
        </footer>
      </div>
    </SidePanel>
  )
})

AdjustmentRequestSidePanel.displayName = "AdjustmentRequestSidePanel"
