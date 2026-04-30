import type { ApexOptions } from "apexcharts"

import { ApexChart } from "@/components/structure/Charts/ApexChart"
import {
  BASE_AXIS_LABEL_STYLE,
  BASE_CHART_OPTIONS,
  CHART_PALETTE,
} from "@/components/structure/Charts/constants"
// Components
import { Typography } from "@/components/structure/Typography"

import type { WorkedHoursItem } from "../../types"

interface Props {
  items: WorkedHoursItem[]
}

export const WorkedHoursLineChart: React.FC<Props> = ({ items }) => {
  const safeItems = items.length > 0 ? items : [{ label: "-", hours: 0 }]
  const maxHours = getRoundedMax(
    safeItems.map((item) => item.hours),
    2
  )
  const options: ApexOptions = {
    ...BASE_CHART_OPTIONS,
    chart: {
      ...BASE_CHART_OPTIONS.chart,
      type: "area",
    },
    colors: [CHART_PALETTE.brand600],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.22,
        opacityTo: 0.04,
        shadeIntensity: 1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      ...BASE_CHART_OPTIONS.grid,
      padding: {
        left: 4,
        right: 10,
      },
    },
    markers: {
      hover: {
        sizeOffset: 2,
      },
      size: 4,
      strokeColors: CHART_PALETTE.white,
      strokeWidth: 2,
    },
    stroke: {
      curve: "smooth",
      lineCap: "round",
      width: 3,
    },
    tooltip: {
      ...BASE_CHART_OPTIONS.tooltip,
      y: {
        formatter(value) {
          return formatHours(value)
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
      max: maxHours,
      min: 0,
      tickAmount: 4,
      labels: {
        formatter(value) {
          return `${Number(value ?? 0).toFixed(0)}h`
        },
        style: BASE_AXIS_LABEL_STYLE,
      },
    },
  }
  const series = [
    {
      name: "Horas trabalhadas",
      data: safeItems.map((item) => item.hours),
    },
  ]

  return (
    <section className="rounded-xl bg-surface-card px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <Typography variant="h4" value="Horas Trabalhadas por Dia" />

      <div className="mt-8 overflow-hidden rounded-lg">
        <ApexChart
          type="area"
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

function formatHours(value: number) {
  return `${Number(value ?? 0).toFixed(1)}h`
}
