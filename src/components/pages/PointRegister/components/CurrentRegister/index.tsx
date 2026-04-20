// External Libraries
import React from "react"

// Components
import { Table, type TableRowData } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Types
import type { PointRecord } from "../../types"

// Utils
import { getPointStatusClass, getPointTypeClass } from "../../utils"

interface Props {
  records: PointRecord[]
}

export const CurrentRegisters: React.FC<Props> = ({ records }) => {
  const tableData = records.map<TableRowData>((record) => ({
    Horário: {
      valor: record.time,
    },
    Tipo: {
      valor: record.type,
      color: getPointTypeClass(record.type),
    },
    Status: {
      valor: record.status,
      tipo: "badge",
      color: getPointStatusClass(record.status),
    },
  }))

  return (
    <section className="flex min-h-65 flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] xl:max-h-75">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Typography variant="caption" value={`${records.length} registros`} />
      </div>

      <Table
        data={tableData}
        minWidth="480px"
        sideScroll={false}
        className="min-h-0 xl:flex-1 xl:overflow-y-auto"
        emptyMessage="Nenhum registro hoje"
        getRowKey={(_, index) => records[index].id}
      />
    </section>
  )
}
