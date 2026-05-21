import type { FC } from "react"

import { Skeleton, SkeletonTable } from "@/components/structure/Skeleton"

export const AuditFiltersSkeleton: FC = () => {
  return (
    <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`audit-filter-skeleton-${index}`}
            className={index === 4 ? "xl:col-span-2" : ""}
          >
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  )
}

export const AuditTableSkeleton: FC = () => {
  return (
    <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-4 w-24" />
      </div>

      <SkeletonTable
        columns={7}
        rows={6}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-40" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </section>
  )
}
