import dynamic from "next/dynamic"
import React from "react"

import type { Props } from "./types"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

export const ApexChart: React.FC<Props> = ({
  className = "",
  height = "100%",
  width = "100%",
  ...props
}) => {
  return (
    <div className={className}>
      <ReactApexChart {...props} height={height} width={width} />
    </div>
  )
}
