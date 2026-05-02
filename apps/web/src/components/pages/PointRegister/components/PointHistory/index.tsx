// External Libraries
import React from "react"

// Components
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Utils
import { Header } from "@/components/structure/Header"
import { formatWorkdayDate, getPointStatusClass } from "../../utils"

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
    icon: "update",
  },
]

export const PointHistory: React.FC<Props> = ({
  onAdjustmentRequest,
  onRecordSelect,
  records,
}) => {
  const tableData = records.map<TableRowData>((record) => ({
    Data: {
      value: formatWorkdayDate(record.workdayDate),
    },
    Registros: {
      value: record.recordsCount,
    },
    "Horas trabalhadas": {
      value: record.workedHours,
    },
    "Horas extras": {
      value: record.extraHours,
    },
    "Horas faltantes": {
      value: record.missingHours,
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

    console.log(actionId)

    console.log(record)
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
          label="Historico de ponto"
          subtitle="Resumo diario da ultima semana util trabalhada"
        />

        <Typography variant="caption" value={`${records.length} dias`} />
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
