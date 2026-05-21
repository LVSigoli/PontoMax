import type { CSSProperties, FC, HTMLAttributes } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface SkeletonTableProps {
  columns?: number
  rows?: number
  hasActions?: boolean
  className?: string
  contentClassName?: string
  showHeader?: boolean
}

export const Skeleton: FC<SkeletonProps> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-surface-muted ${className}`.trim()}
      {...props}
    />
  )
}

export const SkeletonTable: FC<SkeletonTableProps> = ({
  columns = 4,
  rows = 5,
  hasActions = false,
  className = "",
  contentClassName = "",
  showHeader = true,
}) => {
  const totalColumns = columns + (hasActions ? 1 : 0)
  const gridTemplateColumns = [
    ...Array.from({ length: columns }, () => "minmax(0, 1fr)"),
    ...(hasActions ? ["96px"] : []),
  ].join(" ")
  const gridStyle: CSSProperties = {
    gridTemplateColumns,
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border-subtle bg-surface-card ${className}`.trim()}>
      {showHeader ? (
        <div
          className="grid gap-4 border-b border-border-subtle px-4 py-3"
          style={gridStyle}
        >
          {Array.from({ length: totalColumns }, (_, index) => (
            <Skeleton
              key={`header-${index}`}
              className={`h-4 ${getSkeletonWidthClass(index)}`}
            />
          ))}
        </div>
      ) : null}

      <div className={`grid gap-0 ${contentClassName}`.trim()}>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 border-b border-border-subtle px-4 py-4 last:border-b-0"
            style={gridStyle}
          >
            {Array.from({ length: totalColumns }, (_, columnIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${columnIndex}`}
                className={`h-4 ${getSkeletonWidthClass(rowIndex + columnIndex + 1)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function getSkeletonWidthClass(index: number) {
  const widthClasses = ["w-16", "w-20", "w-24", "w-28", "w-32", "w-36"]

  return widthClasses[index % widthClasses.length]
}
