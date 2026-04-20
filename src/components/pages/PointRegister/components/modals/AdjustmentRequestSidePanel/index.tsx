// External Libraries
import { forwardRef, useImperativeHandle, useRef } from "react"

// Components
import { Button } from "@/components/structure/Button"
import {
  SidePanel,
  type SidePanelMethods,
} from "@/components/structure/SidePanel"
import {
  Table,
  type TableAction,
  type TableRowData,
} from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Types
import type { PointRecord } from "../../../types"
import type {
  AdjustmentRequestSidePanelMethods,
  AdjustmentRequestSidePanelProps,
} from "./types"

const POINT_TYPES: PointRecord["type"][] = ["Entrada", "Saída"]

const ADJUSTMENT_ACTIONS: TableAction[] = [
  {
    id: "remove",
    label: "Remover",
    color: "text-danger-700",
    icon: <span className="text-sm leading-none">×</span>,
  },
]

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

      if (actionId === "remove" && record) {
        onRecordRemove(record.id)
      }
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
              className="mt-11"
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

            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-content-secondary transition hover:text-brand-600"
              onClick={onAddRecord}
            >
              <span className="flex size-5 items-start justify-center rounded border border-content-secondary text-base leading-none">
                +
              </span>
              Adicionar registro
            </button>

            <label className="mt-7 block">
              <Typography variant="b2" fontWeight={700} value="Justificativa" />
              <textarea
                value={justification}
                placeholder="Digite sua justificativa..."
                className="mt-2 min-h-32 w-full resize-none rounded-lg border border-border-default bg-surface-card px-3 py-3 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-border-focus focus:ring-4 focus:ring-brand-100"
                onChange={(event) => onJustificationChange(event.target.value)}
              />
            </label>
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

export type { AdjustmentRequestSidePanelMethods } from "./types"
