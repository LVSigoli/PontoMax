import type { ApexOptions } from "apexcharts"

import {
  ApexChart,
} from "@/components/structure/Charts/ApexChart"
import {
  BASE_AXIS_LABEL_STYLE,
  BASE_CHART_OPTIONS,
  CHART_PALETTE,
} from "@/components/structure/Charts/constants"
// Components
import { Typography } from "@/components/structure/Typography"

import type { SolicitationChartItem } from "../../types"

interface Props {
  items: SolicitationChartItem[]
}

export const SolicitationBarChart: React.FC<Props> = ({ items }) => {
  const safeItems =
    items.length > 0
      ? items
      : [{ label: "-", refused: 0, pending: 0, approved: 0 }]
  const maxValue = getRoundedMax(
    safeItems.flatMap((item) => [item.refused, item.pending, item.approved]),
    5
  )
  const series = [
    {
      name: "Recusado",
      data: safeItems.map((item) => item.refused),
    },
    {
      name: "Pendente",
      data: safeItems.map((item) => item.pending),
    },
    {
      name: "Aprovado",
      data: safeItems.map((item) => item.approved),
    },
  ]
  const options: ApexOptions = {
    ...BASE_CHART_OPTIONS,
    chart: {
      ...BASE_CHART_OPTIONS.chart,
      stacked: false,
      type: "bar",
    },
    colors: [
      CHART_PALETTE.danger500,
      CHART_PALETTE.warning500,
      CHART_PALETTE.success500,
    ],
    grid: {
      ...BASE_CHART_OPTIONS.grid,
      padding: {
        left: 0,
        right: 6,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "52%",
      },
    },
    stroke: {
      show: false,
    },
    tooltip: {
      ...BASE_CHART_OPTIONS.tooltip,
      y: {
        formatter(value) {
          return `${Number(value ?? 0)} solicitacoes`
        },
      },
    },
    xaxis: {
      categories: safeItems.map((item) => item.label),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: BASE_AXIS_LABEL_STYLE,
      },
    },
    yaxis: {
      forceNiceScale: true,
      max: maxValue,
      min: 0,
      tickAmount: Math.min(5, maxValue),
      labels: {
        formatter(value) {
          return Number(value ?? 0).toFixed(0)
        },
        style: BASE_AXIS_LABEL_STYLE,
      },
    },
  }

  return (
    <section className="rounded-xl bg-surface-card px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h4" value="Solicitacoes de ajuste de ponto" />

        <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
          <Legend color="bg-danger-500" label="Recusado" />
          <Legend color="bg-warning-500" label="Pendente" />
          <Legend color="bg-success-500" label="Aprovado" />
        </div>
      </div>

      <div className="mt-6">
        <ApexChart
          type="bar"
          height={240}
          series={series}
          options={options}
        />
      </div>
    </section>
  )
}

function getRoundedMax(values: number[], step: number) {
  const highestValue = Math.max(...values, 0)

  if (highestValue === 0) {
    return step
  }

  return Math.ceil(highestValue / step) * step
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-4 rounded-sm ${color}`} />
      {label}
    </span>
  )
}
