import React from "react"

import { Typography } from "@/components/structure/Typography"

import { AnalysisCard } from "../AnalysisCard"
import type { UserAnalysisItem } from "../../types"

interface Props {
  items: UserAnalysisItem[]
}

export const HistoryAnalysisSection: React.FC<Props> = ({
  items,
}) => {
  return (
    <section className="grid gap-4">
      <Typography
        variant="h4"
        value="Resumo do historico"
        className="text-xl"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <AnalysisCard key={item.type} item={item} />
        ))}
      </div>
    </section>
  )
}
