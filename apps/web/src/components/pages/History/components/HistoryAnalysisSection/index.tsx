import React from "react"

import { Typography } from "@/components/structure/Typography"

import { AnalysisCard } from "../AnalysisCard"
import type { UserAnalysisItem } from "../../types"

interface Props {
  items: UserAnalysisItem[]
  errorMessage: string
}

export const HistoryAnalysisSection: React.FC<Props> = ({
  items,
  errorMessage,
}) => {
  return (
    <section className="grid gap-4">
      <Typography
        variant="h4"
        value="Analise de solicitacoes"
        className="text-xl"
      />

      {errorMessage ? (
        <Typography
          variant="legal"
          value={errorMessage}
          className="text-danger-700"
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <AnalysisCard key={item.type} item={item} />
        ))}
      </div>
    </section>
  )
}
