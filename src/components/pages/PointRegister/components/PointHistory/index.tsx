// External Libraries
import React from "react"

// Components
import { Table, type TableRowData } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

// Utils
import { Header } from "@/components/structure/Header"
import { getPointStatusClass, getPointTypeClass } from "../../utils"

// Types
import type { Props } from "./types"

export const PointHistory: React.FC<Props> = ({ records }) => {
  const tableData = records.map<TableRowData>((record) => ({
    "Horas trabalhadas": {
      valor: record.workedHours,
    },
    "Horas extras": {
      valor: record.extraHours,
    },
    "Horas faltantes": {
      valor: record.missingHours,
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
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Header
          titleVariant="h4"
          label="Histórico de ponto"
          subtitle="Acompanhe seus registros mais recentes"
        />

        <Typography variant="caption" value={`${records.length} registros`} />
      </div>

      <Table data={tableData} getRowKey={(_, index) => records[index].id} />
    </section>
  )
}
