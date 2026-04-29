// External Libraries
import React from "react"

// Components
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Utils
import { getPointTypeClass } from "../../utils"

// Types
import type { TableRowData } from "@/components/structure/Table/types"
import type { PointRecord } from "../../types"

interface Props {
  records: PointRecord[]
}

export const CurrentRegisters: React.FC<Props> = ({ records }) => {
  const tableData = records.map<TableRowData>((record) => ({
    Horário: {
      value: record.time,
    },
    Tipo: {
      value: record.type,
      color: getPointTypeClass(record.type),
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
