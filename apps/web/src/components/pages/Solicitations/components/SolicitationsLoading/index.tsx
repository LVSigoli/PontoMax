import type { FC } from "react"

import { Skeleton } from "@/components/structure/Skeleton"

interface Props {
  items?: number
}

export const SolicitationsGridSkeleton: FC<Props> = ({
  items = 8,
}) => {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: items }, (_, index) => (
        <article
          key={`solicitation-skeleton-${index}`}
          className="grid min-h-57 gap-3 rounded-xl bg-surface-card p-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="border-t border-border-subtle pt-3">
            <Skeleton className="h-4 w-32" />
          </div>
        </article>
      ))}
    </section>
  )
}
