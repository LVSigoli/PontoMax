// External Libraries
import { forwardRef, useImperativeHandle, useRef } from "react"

// Components
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Utils
import { buildTableData, getTextLabel } from "./utils"

// Types
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type {
  DayHistorySidePanelMethods,
  DayHistorySidePanelProps,
} from "./types"

export const DayHistorySidePanel = forwardRef<
  DayHistorySidePanelMethods,
  DayHistorySidePanelProps
>(({ record }, ref) => {
  // Refs
  const sidePanelRef = useRef<SidePanelMethods>(null)

  // Constants
  const tableData: TableRowData[] = buildTableData(record)
  const subtitle = getTextLabel(record)

  //  Hooks
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
      title="Histórico do dia"
      subtitle={subtitle}
      widthClassName="max-w-lg"
    >
      <div className="flex min-h-full flex-col gap-6 p-6">
        {record ? (
          <div className="grid gap-3 rounded-xl bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <Typography variant="b2" value="Horas trabalhadas" />
              <Typography
                variant="b2"
                fontWeight={700}
                value={record.workedHours}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Typography variant="b2" value="Horas extras" />

              <Typography
                variant="b2"
                fontWeight={700}
                value={record.extraHours}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Typography variant="b2" value="Horas faltantes" />

              <Typography
                variant="b2"
                fontWeight={700}
                value={record.missingHours}
              />
            </div>
          </div>
        ) : null}

        <section className="grid gap-3">
          <Typography variant="b1" fontWeight={700} value="Registros do dia" />

          <Table
            data={tableData}
            minWidth="420px"
            emptyMessage="Nenhum registro selecionado"
          />
        </section>
      </div>
    </SidePanel>
  )
})

DayHistorySidePanel.displayName = "DayHistorySidePanel"
