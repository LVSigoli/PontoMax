import { Skeleton } from "@/components/structure/Skeleton"

export function ManagementFormSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
