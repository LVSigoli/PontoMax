// Components
import { Typography } from "@/components/structure/Typography"

import type { WorkedHoursItem } from "../../types"

const WIDTH = 640
const HEIGHT = 150
const TOP_PADDING = 14
const BOTTOM_PADDING = 18
const MAX_HOURS = 10

interface Props {
  items: WorkedHoursItem[]
}

export const WorkedHoursLineChart: React.FC<Props> = ({ items }) => {
  const safeItems = items.length > 0 ? items : [{ label: "-", hours: 0 }]

  const points = safeItems.map((item, index) => {
    const x =
      safeItems.length === 1 ? WIDTH / 2 : (index / (safeItems.length - 1)) * WIDTH
    const y =
      TOP_PADDING +
      (1 - item.hours / MAX_HOURS) * (HEIGHT - TOP_PADDING - BOTTOM_PADDING)

    return { ...item, x, y }
  })

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ")
  const areaPoints = `0,${HEIGHT - BOTTOM_PADDING} ${polylinePoints} ${WIDTH},${
    HEIGHT - BOTTOM_PADDING
  }`

  return (
    <section className="rounded-xl bg-surface-card px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <Typography variant="h4" value="Horas Trabalhadas por Dia" />

      <div className="mt-8 overflow-hidden rounded-lg">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-44 w-full"
          role="img"
          aria-label="Grafico de horas trabalhadas por dia"
        >
          <defs>
            <linearGradient id="worked-hours-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }).map((_, index) => {
            const y =
              TOP_PADDING +
              (index / 4) * (HEIGHT - TOP_PADDING - BOTTOM_PADDING)

            return (
              <line
                key={index}
                x1="0"
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 4"
              />
            )
          })}

          <polygon points={areaPoints} fill="url(#worked-hours-area)" />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2563eb"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          {points.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#2563eb"
            />
          ))}

          {points.map((point) => (
            <text
              key={point.label}
              x={point.x}
              y={HEIGHT - 2}
              textAnchor="middle"
              className="fill-content-muted text-[10px]"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  )
}
