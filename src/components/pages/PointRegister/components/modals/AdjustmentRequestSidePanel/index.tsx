// External Libraries
import { forwardRef, useImperativeHandle, useRef } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Assets
import PlusIcon from "@/assets/icons/plus.svg"

// Utils
import { ADJUSTMENT_ACTIONS, POINT_TYPES } from "./constants"

// Types
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import { TextArea } from "@/components/structure/TextArea"
import type { PointRecord } from "../../../types"
import type {
  AdjustmentRequestSidePanelMethods,
  AdjustmentRequestSidePanelProps,
} from "./types"

export const AdjustmentRequestSidePanel = forwardRef<
  AdjustmentRequestSidePanelMethods,
  AdjustmentRequestSidePanelProps
>(
  (
    {
      justification,
      records,
      onAddRecord,
      onCancel,
      onConfirm,
      onJustificationChange,
      onRecordRemove,
      onRecordTimeChange,
      onRecordTypeChange,
    },
    ref
  ) => {
    // Refs
    const sidePanelRef = useRef<SidePanelMethods>(null)

    const tableData = records.map<TableRowData>((record) => ({
      Horario: {
        valor: (
          <input
            type="time"
            value={record.time.slice(0, 5)}
            className="w-24 rounded-md border border-transparent bg-transparent text-sm font-semibold text-content-muted outline-none transition focus:border-border-focus focus:bg-surface-page"
            onChange={(event) =>
              onRecordTimeChange(record.id, event.target.value)
            }
          />
        ),
      },
      Tipo: {
        valor: (
          <select
            value={record.type}
            className={`rounded-md border border-transparent bg-transparent text-sm font-semibold outline-none transition focus:border-border-focus focus:bg-surface-page ${
              record.type === "Entrada" ? "text-success-700" : "text-danger-700"
            }`}
            onChange={(event) =>
              onRecordTypeChange(
                record.id,
                event.target.value as PointRecord["type"]
              )
            }
          >
            {POINT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        ),
      },
    }))

    // Functions
    function handleCancel() {
      onCancel()
      sidePanelRef.current?.close()
    }

    function handleConfirm() {
      onConfirm()
      sidePanelRef.current?.close()
    }

    function handleTableActionClick(actionId: string, item: TableRowData) {
      const recordIndex = tableData.indexOf(item)
      const record = records[recordIndex]

      if (actionId === "remove" && record) onRecordRemove(record.id)
    }

    useImperativeHandle(
      ref,
      () => ({
        close: () => sidePanelRef.current?.close(),
        open: () => sidePanelRef.current?.open(),
        toggle: () => sidePanelRef.current?.toggle(),
      }),
      []
    )

    return (
      <SidePanel
        ref={sidePanelRef}
        widthClassName="max-w-[456px]"
        className="bg-surface-page"
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
              data={tableData}
              allowActions
              minWidth="360px"
              sideScroll={false}
              actions={ADJUSTMENT_ACTIONS}
              getRowKey={(_, index) => records[index].id}
              className="mt-5 overflow-hidden rounded-xl border border-border-subtle bg-surface-card"
              onActionClick={handleTableActionClick}
            />

            <Button
              variant="text"
              icon={PlusIcon}
              iconPlacement="start"
              color="primary"
              value="Adicionar registro"
              onClick={onAddRecord}
            />

            <TextArea
              label="Justificativa"
              value={justification}
              onChange={onJustificationChange}
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
  }
)

AdjustmentRequestSidePanel.displayName = "AdjustmentRequestSidePanel"
