import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../../../types"

interface ExportAnalyticsDashboardToExcelParams {
  balances: EmployeeHourBalance[]
  companyLabel: string
  metrics: AnalyticsMetric[]
  periodSummary: string
  solicitationChart: SolicitationChartItem[]
  workedHours: WorkedHoursItem[]
}

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const SHEET_NAMES = {
  balances: "Saldos",
  filters: "Filtros",
  metrics: "Resumo",
  solicitationChart: "Solicitacoes",
  workedHours: "Horas",
} as const

export async function exportAnalyticsDashboardToExcel(
  params: ExportAnalyticsDashboardToExcelParams
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Exportacao disponivel apenas no navegador.")
  }

  const xlsx = await import("xlsx")
  const workbook = xlsx.utils.book_new()
  const generatedAt = new Date()

  const filtersSheet = buildFiltersSheet(xlsx, {
    companyLabel: params.companyLabel,
    generatedAt,
    periodSummary: params.periodSummary,
  })
  const metricsSheet = buildMetricsSheet(xlsx, params.metrics)
  const balancesSheet = buildBalancesSheet(xlsx, params.balances)
  const solicitationSheet = buildSolicitationSheet(
    xlsx,
    params.solicitationChart
  )
  const workedHoursSheet = buildWorkedHoursSheet(xlsx, params.workedHours)

  xlsx.utils.book_append_sheet(workbook, filtersSheet, SHEET_NAMES.filters)
  xlsx.utils.book_append_sheet(workbook, metricsSheet, SHEET_NAMES.metrics)
  xlsx.utils.book_append_sheet(workbook, balancesSheet, SHEET_NAMES.balances)
  xlsx.utils.book_append_sheet(
    workbook,
    solicitationSheet,
    SHEET_NAMES.solicitationChart
  )
  xlsx.utils.book_append_sheet(workbook, workedHoursSheet, SHEET_NAMES.workedHours)

  workbook.Props = {
    Author: "PontoMax",
    CreatedDate: generatedAt,
    Subject: "Exportacao do painel gerencial",
    Title: "Painel gerencial",
  }

  const workbookData = xlsx.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer

  downloadWorkbook(
    workbookData,
    buildFileName(params.companyLabel, params.periodSummary, generatedAt)
  )
}

function buildFiltersSheet(
  xlsx: typeof import("xlsx"),
  params: {
    companyLabel: string
    generatedAt: Date
    periodSummary: string
  }
) {
  const rows = [
    {
      Filtro: "Periodo",
      Valor: params.periodSummary,
    },
    {
      Filtro: "Empresa",
      Valor: params.companyLabel,
    },
    {
      Filtro: "Gerado em",
      Valor: formatDateTime(params.generatedAt),
    },
  ]

  const sheet = xlsx.utils.json_to_sheet(rows)
  sheet["!cols"] = [{ wch: 20 }, { wch: 60 }]
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:B1" }

  return sheet
}

function buildMetricsSheet(
  xlsx: typeof import("xlsx"),
  metrics: AnalyticsMetric[]
) {
  const rows = metrics.length
    ? metrics.map((metric) => ({
        Indicador: metric.label,
        Valor: metric.data,
        Descricao: metric.subtitle,
      }))
    : [
        {
          Indicador: "Nenhum indicador",
          Valor: "-",
          Descricao: "Sem dados disponiveis para o filtro aplicado.",
        },
      ]

  const sheet = xlsx.utils.json_to_sheet(rows)
  sheet["!cols"] = [{ wch: 30 }, { wch: 26 }, { wch: 70 }]
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:C1" }

  return sheet
}

function buildBalancesSheet(
  xlsx: typeof import("xlsx"),
  balances: EmployeeHourBalance[]
) {
  const rows = balances.length
    ? balances.map((balance) => ({
        Colaborador: balance.name,
        Saldo: balance.balance,
        "Saldo em minutos": formatBalanceMinutes(balance.balance),
        Status: formatBalanceStatus(balance.status),
      }))
    : [
        {
          Colaborador: "Sem dados",
          Saldo: "-",
          "Saldo em minutos": 0,
          Status: "Sem dados",
        },
      ]

  const sheet = xlsx.utils.json_to_sheet(rows)
  sheet["!cols"] = [
    { wch: 34 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
  ]
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:D1" }

  return sheet
}

function buildSolicitationSheet(
  xlsx: typeof import("xlsx"),
  items: SolicitationChartItem[]
) {
  const rows = items.length
    ? items.map((item) => ({
        Periodo: item.label,
        Aprovadas: item.approved,
        Pendentes: item.pending,
        Recusadas: item.refused,
        Total: item.approved + item.pending + item.refused,
      }))
    : [
        {
          Periodo: "Sem dados",
          Aprovadas: 0,
          Pendentes: 0,
          Recusadas: 0,
          Total: 0,
        },
      ]

  const sheet = xlsx.utils.json_to_sheet(rows)
  sheet["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
  ]
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:E1" }

  return sheet
}

function buildWorkedHoursSheet(
  xlsx: typeof import("xlsx"),
  items: WorkedHoursItem[]
) {
  const rows = items.length
    ? items.map((item) => ({
        Periodo: item.label,
        Horas: item.hours,
        "Horas formatadas": formatWorkedHours(item.hours),
      }))
    : [
        {
          Periodo: "Sem dados",
          Horas: 0,
          "Horas formatadas": "-",
        },
      ]

  const sheet = xlsx.utils.json_to_sheet(rows)
  sheet["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 20 }]
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:C1" }

  return sheet
}

function buildFileName(
  companyLabel: string,
  periodSummary: string,
  generatedAt: Date
) {
  const safeCompanyLabel = toFileNamePart(companyLabel) || "empresa"
  const safePeriodSummary = toFileNamePart(periodSummary) || "periodo"

  return [
    "painel-gerencial",
    safePeriodSummary,
    safeCompanyLabel,
    formatFileTimestamp(generatedAt),
  ].join("_") + ".xlsx"
}

function downloadWorkbook(workbookData: ArrayBuffer, fileName: string) {
  const blob = new Blob([workbookData], {
    type: XLSX_MIME_TYPE,
  })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.rel = "noopener"
  anchor.style.display = "none"

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

function formatBalanceStatus(status: EmployeeHourBalance["status"]) {
  if (status === "positive") return "Positivo"
  if (status === "negative") return "Negativo"

  return "Neutro"
}

function formatBalanceMinutes(balance: string) {
  const normalized = balance.trim()

  if (!normalized || normalized === "-") {
    return 0
  }

  const sign = normalized.startsWith("-") ? -1 : 1
  const numeric = normalized.replace(/^[+-]/, "")
  const match = numeric.match(/(\d+)h\s+(\d+)min/)

  if (!match) {
    return 0
  }

  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)

  return sign * (hours * 60 + minutes)
}

function formatWorkedHours(hours: number) {
  const totalMinutes = Math.max(0, Math.round(hours * 60))
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(wholeHours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}min`
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatFileTimestamp(date: Date) {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}_${hours}-${minutes}`
}

function toFileNamePart(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
