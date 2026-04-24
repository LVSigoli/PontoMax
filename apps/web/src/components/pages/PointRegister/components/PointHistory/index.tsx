// External Libraries
import React from "react"

// Assets
import UpdateIcon from "@/assets/icons/update.svg"

// Components
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Utils
import { Header } from "@/components/structure/Header"
import { getPointStatusClass, getPointTypeClass } from "../../utils"

// Types
import type {
  TableAction,
  TableRowData,
} from "@/components/structure/Table/types"
import type { Props } from "./types"

const POINT_HISTORY_ACTIONS: TableAction[] = [
  {
    id: "request-adjustment",
    label: "Solicitar ajuste",
    color: "text-warning-700",
    icon: UpdateIcon,
  },
]

export const PointHistory: React.FC<Props> = ({
  onAdjustmentRequest,
  onRecordSelect,
  records,
}) => {
  const tableData = records.map<TableRowData>((record) => ({
    "Horas trabalhadas": {
      value: record.workedHours,
    },
    "Horas extras": {
      value: record.extraHours,
    },
    "Horas faltantes": {
      value: record.missingHours,
    },
    Tipo: {
      value: record.type,
      color: getPointTypeClass(record.type),
    },
    Status: {
      value: record.status,
      type: "badge",
      color: getPointStatusClass(record.status),
    },
  }))

  function handlePointHistoryActionClick(actionId: string, item: TableRowData) {
    const recordIndex = tableData.indexOf(item)
    const record = records[recordIndex]

    if (actionId === "request-adjustment" && record) {
      onAdjustmentRequest?.(record)
    }
  }

  function handlePointHistoryRowSelect(item: TableRowData) {
    const recordIndex = tableData.indexOf(item)
    const record = records[recordIndex]

    if (record) onRecordSelect?.(record)
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Header
          titleVariant="h4"
          label="Histórico de ponto"
          subtitle="Acompanhe seus registros mais recentes"
        />

        <Typography variant="caption" value={`${records.length} registros`} />
      </div>

      <Table
        data={tableData}
        getRowKey={(_, index) => records[index].id}
        allowActions
        actions={POINT_HISTORY_ACTIONS}
        onActionClick={handlePointHistoryActionClick}
        onRowSelect={handlePointHistoryRowSelect}
      />
    </section>
  )
}
