import { Skeleton } from "@/components/structure/Skeleton"

export function CalendarSkeleton() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
      <article className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 sm:p-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {Array.from({ length: 49 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </article>
      <article className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 sm:p-5">
        <Skeleton className="h-6 w-44" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </article>
    </section>
  )
}
