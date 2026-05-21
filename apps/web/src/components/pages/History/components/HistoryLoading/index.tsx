import type { FC } from "react"

import { Skeleton, SkeletonTable } from "@/components/structure/Skeleton"

export const HistoryAnalysisSkeleton: FC = () => {
  return (
    <section className="grid gap-4">
      <Skeleton className="h-7 w-48" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <article
            key={`history-analysis-skeleton-${index}`}
            className="grid min-h-34 content-between rounded-xl bg-surface-card px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex flex-row items-center gap-1">
              <Skeleton className="h-8 w-24" />
            </div>

            <Skeleton className="h-3 w-36" />
          </article>
        ))}
      </div>
    </section>
  )
}

export const HistoryTableSkeleton: FC = () => {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-4 w-28" />
      </div>

      <SkeletonTable
        columns={6}
        rows={6}
        hasActions
      />

      <div className="flex justify-center pt-4">
        <Skeleton className="h-4 w-28" />
      </div>
    </section>
  )
}
