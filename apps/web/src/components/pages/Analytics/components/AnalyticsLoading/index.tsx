import type { FC } from "react"

import { Skeleton } from "@/components/structure/Skeleton"

export const AnalyticsMetricsSkeleton: FC = () => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => (
        <article
          key={`metric-skeleton-${index}`}
          className="grid min-h-38 content-between rounded-xl bg-surface-card px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />

            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="pl-16">
            <Skeleton className="h-8 w-24" />
          </div>

          <Skeleton className="h-3 w-40" />
        </article>
      ))}
    </div>
  )
}

export const AnalyticsContentSkeleton: FC = () => {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.7fr]">
      <section className="rounded-xl bg-surface-card px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <Skeleton className="h-7 w-64" />

        <div className="mt-7 grid gap-0">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`balance-skeleton-${index}`}
              className="flex items-center justify-between gap-6 border-b border-border-subtle px-2 py-4 last:border-b-0"
            >
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        <ChartCardSkeleton
          titleWidthClassName="w-64"
          withLegend
        />
        <ChartCardSkeleton titleWidthClassName="w-52" />
      </div>
    </section>
  )
}

function ChartCardSkeleton({
  titleWidthClassName,
  withLegend = false,
}: {
  titleWidthClassName: string
  withLegend?: boolean
}) {
  return (
    <section className="rounded-xl bg-surface-card px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className={`h-7 ${titleWidthClassName}`} />

        {withLegend ? (
          <div className="flex flex-wrap items-center gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`legend-skeleton-${index}`}
                className="flex items-center gap-2"
              >
                <Skeleton className="h-2 w-4 rounded-sm" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </section>
  )
}
