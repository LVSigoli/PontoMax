import type { ApexOptions } from "apexcharts"

export interface Props {
  type:
    | "line"
    | "area"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap"
  series: NonNullable<ApexOptions["series"]>
  options: ApexOptions
  width?: string | number
  height?: string | number
  className?: string
}
