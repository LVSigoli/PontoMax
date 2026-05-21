import type { FC } from "react"

import { Skeleton, SkeletonTable } from "@/components/structure/Skeleton"

export const PointCardSkeleton: FC = () => {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col justify-between gap-8 p-0">
        <div className="flex flex-col justify-start gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <div className="flex flex-row items-center gap-2 rounded-xl bg-surface-muted px-4 py-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </section>
  )
}

export const CurrentRegistersSkeleton: FC = () => {
  return (
    <section className="flex min-h-65 flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] xl:max-h-75">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-24" />
      </div>

      <SkeletonTable
        columns={2}
        rows={4}
        showHeader={false}
        contentClassName="xl:flex-1"
      />
    </section>
  )
}

export const PointHistorySkeleton: FC = () => {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>

        <Skeleton className="h-4 w-16" />
      </div>

      <SkeletonTable
        columns={6}
        rows={5}
        hasActions
      />
    </section>
  )
}
