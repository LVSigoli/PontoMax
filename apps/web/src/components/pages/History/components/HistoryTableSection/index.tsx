import React from "react"

import { Header } from "@/components/structure/Header"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

import type {
  TableAction,
  TableRowData,
} from "@/components/structure/Table/types"

interface Props {
  data: TableRowData[]
  actions: TableAction[]
  historyRecordsCount: number
  loadMoreLabel: string
  loadMoreRef: React.RefObject<HTMLDivElement | null>
  getRowKey: (_row: TableRowData, index: number) => React.Key
  onRowSelect: (row: TableRowData) => void
  onActionClick: (actionId: string, row: TableRowData) => void
}

export const HistoryTableSection: React.FC<Props> = ({
  data,
  actions,
  historyRecordsCount,
  loadMoreLabel,
  loadMoreRef,
  getRowKey,
  onRowSelect,
  onActionClick,
}) => {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Header
          titleVariant="h4"
          label="Historico de ponto"
          subtitle="Resumo diario dos dias trabalhados anteriores"
        />

        <Typography
          variant="caption"
          value={`${historyRecordsCount} dias carregados`}
        />
      </div>

      <Table
        data={data}
        getRowKey={getRowKey}
        allowActions
        actions={actions}
        onActionClick={onActionClick}
        onRowSelect={onRowSelect}
        emptyMessage="Nenhum historico encontrado"
      />

      <div ref={loadMoreRef} className="flex justify-center pt-4">
        <Typography variant="caption" value={loadMoreLabel} />
      </div>
    </section>
  )
}
