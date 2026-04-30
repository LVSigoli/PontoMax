import type { ApexOptions } from "apexcharts"

export const CHART_FONT_FAMILY =
  'Inter, Roboto, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'

export const CHART_PALETTE = {
  brand500: "#3b82f6",
  brand600: "#2563eb",
  borderDefault: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  contentMuted: "#94a3b8",
  contentSecondary: "#475569",
  danger500: "#ef4444",
  success500: "#22c55e",
  warning500: "#facc15",
  white: "#ffffff",
} as const

export const BASE_AXIS_LABEL_STYLE = {
  colors: CHART_PALETTE.contentMuted,
  fontFamily: CHART_FONT_FAMILY,
  fontSize: "12px",
  fontWeight: 500,
}

export const BASE_CHART_OPTIONS: ApexOptions = {
  chart: {
    animations: {
      enabled: true,
      speed: 380,
    },
    background: "transparent",
    fontFamily: CHART_FONT_FAMILY,
    foreColor: CHART_PALETTE.contentSecondary,
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: CHART_PALETTE.borderSubtle,
    strokeDashArray: 4,
    padding: {
      left: 8,
      right: 8,
    },
  },
  legend: {
    show: false,
  },
  states: {
    active: {
      filter: {
        type: "none",
      },
    },
    hover: {
      filter: {
        type: "none",
      },
    },
  },
  tooltip: {
    theme: "light",
  },
}
