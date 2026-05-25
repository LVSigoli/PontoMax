import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "../../../types"

interface ExportAnalyticsDashboardToPdfParams {
  balances: EmployeeHourBalance[]
  balancesTitle: string
  companyLabel: string
  metrics: AnalyticsMetric[]
  periodSummary: string
  solicitationChart: SolicitationChartItem[]
  solicitationChartTitle: string
  workedHours: WorkedHoursItem[]
  workedHoursTitle: string
}

type PdfDocument = InstanceType<typeof import("jspdf").jsPDF>

interface ReportMetadata {
  companyLabel: string
  generatedAt: string
  periodSummary: string
}

interface PageConfig {
  contentWidth: number
  marginBottom: number
  marginX: number
  pageHeight: number
  pageWidth: number
  startY: number
}

export async function exportAnalyticsDashboardToPdf(
  params: ExportAnalyticsDashboardToPdfParams
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Exportacao disponivel apenas no navegador.")
  }

  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({
    compress: true,
    format: "a4",
    orientation: "portrait",
    unit: "pt",
  })

  pdf.setProperties({
    author: "PontoMax",
    creator: "PontoMax",
    subject: `Painel gerencial - ${params.periodSummary}`,
    title: "Painel gerencial",
    keywords: [params.companyLabel, params.periodSummary].join(", "),
  })

  const metadata: ReportMetadata = {
    companyLabel: params.companyLabel,
    generatedAt: formatGeneratedAt(new Date()),
    periodSummary: params.periodSummary,
  }
  const pageConfig = getPageConfig(pdf)
  let pageNumber = 0

  pageNumber = drawMetricsSection(pdf, metadata, pageConfig, params, pageNumber)
  pageNumber = drawBalancesSection(pdf, metadata, pageConfig, params, pageNumber)
  pageNumber = drawSolicitationSection(
    pdf,
    metadata,
    pageConfig,
    params,
    pageNumber
  )
  drawWorkedHoursSection(pdf, metadata, pageConfig, params, pageNumber)

  pdf.save(buildFileName(params.companyLabel, params.periodSummary))
}

function drawMetricsSection(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  params: ExportAnalyticsDashboardToPdfParams,
  pageNumber: number
) {
  let cursorY = startPage(
    pdf,
    metadata,
    pageConfig,
    "Indicadores",
    "Resumo consolidado do periodo",
    pageNumber + 1
  )

  cursorY = drawMetaGrid(pdf, pageConfig, cursorY, metadata)
  cursorY += 18

  const gap = 14
  const cardWidth = (pageConfig.contentWidth - gap) / 2
  const cardHeight = 92

  params.metrics.forEach((metric, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = pageConfig.marginX + column * (cardWidth + gap)
    const y = cursorY + row * (cardHeight + gap)

    drawMetricCard(pdf, x, y, cardWidth, cardHeight, metric)
  })

  return pageNumber + 1
}

function drawBalancesSection(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  params: ExportAnalyticsDashboardToPdfParams,
  pageNumber: number
) {
  const rows = params.balances.map((item) => ({
    balance: item.balance,
    name: item.name,
    status: item.status,
  }))

  return drawTableSection(pdf, metadata, pageConfig, {
    columns: [
      { align: "left", key: "name", label: "Funcionario", width: 360 },
      { align: "right", key: "balance", label: "Saldo", width: 115 },
    ],
    emptyMessage: "Nao ha saldos de horas para exportar neste periodo.",
    pageNumber,
    rows,
    subtitle: params.balancesTitle,
    title: "Saldo de horas",
  })
}

function drawSolicitationSection(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  params: ExportAnalyticsDashboardToPdfParams,
  pageNumber: number
) {
  const totals = params.solicitationChart.reduce(
    (accumulator, item) => ({
      approved: accumulator.approved + item.approved,
      pending: accumulator.pending + item.pending,
      refused: accumulator.refused + item.refused,
    }),
    {
      approved: 0,
      pending: 0,
      refused: 0,
    }
  )

  const rows = params.solicitationChart.map((item) => ({
    approved: formatInteger(item.approved),
    label: item.label,
    pending: formatInteger(item.pending),
    refused: formatInteger(item.refused),
  }))

  return drawTableSection(pdf, metadata, pageConfig, {
    columns: [
      { align: "left", key: "label", label: "Periodo", width: 235 },
      { align: "right", key: "approved", label: "Aprovado", width: 80 },
      { align: "right", key: "pending", label: "Pendente", width: 80 },
      { align: "right", key: "refused", label: "Recusado", width: 80 },
    ],
    emptyMessage: "Nao ha solicitacoes de ajuste para exportar neste periodo.",
    pageNumber,
    rows,
    summaryCards: [
      { label: "Aprovadas", value: formatInteger(totals.approved) },
      { label: "Pendentes", value: formatInteger(totals.pending) },
      { label: "Recusadas", value: formatInteger(totals.refused) },
    ],
    subtitle: params.solicitationChartTitle,
    title: "Solicitacoes de ajuste",
  })
}

function drawWorkedHoursSection(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  params: ExportAnalyticsDashboardToPdfParams,
  pageNumber: number
) {
  const totalHours = params.workedHours.reduce(
    (accumulator, item) => accumulator + item.hours,
    0
  )
  const averageHours =
    params.workedHours.length > 0 ? totalHours / params.workedHours.length : 0
  const peakHours = params.workedHours.reduce<WorkedHoursItem | null>(
    (highest, item) => {
      if (!highest || item.hours > highest.hours) {
        return item
      }

      return highest
    },
    null
  )

  const rows = params.workedHours.map((item) => ({
    hours: formatHours(item.hours),
    label: item.label,
  }))

  return drawTableSection(pdf, metadata, pageConfig, {
    columns: [
      { align: "left", key: "label", label: "Periodo", width: 345 },
      { align: "right", key: "hours", label: "Horas", width: 130 },
    ],
    emptyMessage: "Nao ha horas trabalhadas para exportar neste periodo.",
    pageNumber,
    rows,
    summaryCards: [
      { label: "Horas totais", value: formatHours(totalHours) },
      { label: "Media por registro", value: formatHours(averageHours) },
      {
        label: "Maior registro",
        value: peakHours
          ? `${formatHours(peakHours.hours)} • ${peakHours.label}`
          : "-",
      },
    ],
    subtitle: params.workedHoursTitle,
    title: "Horas trabalhadas",
  })
}

function drawTableSection(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  options: {
    columns: Array<{
      align: "left" | "right"
      key: string
      label: string
      width: number
    }>
    emptyMessage: string
    pageNumber: number
    rows: Array<Record<string, string>>
    subtitle: string
    summaryCards?: Array<{ label: string; value: string }>
    title: string
  }
) {
  let currentPageNumber = options.pageNumber
  let cursorY = startPage(
    pdf,
    metadata,
    pageConfig,
    options.title,
    options.subtitle,
    currentPageNumber + 1
  )

  currentPageNumber += 1

  if (options.summaryCards && options.summaryCards.length > 0) {
    cursorY = drawSummaryCards(pdf, pageConfig, cursorY, options.summaryCards)
    cursorY += 16
  }

  if (options.rows.length === 0) {
    drawEmptyState(pdf, pageConfig, cursorY, options.emptyMessage)
    return currentPageNumber
  }

  cursorY = drawTableHeader(pdf, pageConfig, cursorY, options.columns)

  for (const row of options.rows) {
    const rowHeight = 22
    const nextRowBottom = cursorY + rowHeight

    if (nextRowBottom > pageConfig.pageHeight - pageConfig.marginBottom) {
      cursorY = startPage(
        pdf,
        metadata,
        pageConfig,
        options.title,
        `${options.subtitle} (continua)`,
        currentPageNumber + 1
      )
      currentPageNumber += 1
      cursorY = drawTableHeader(pdf, pageConfig, cursorY, options.columns)
    }

    drawTableRow(pdf, pageConfig, cursorY, options.columns, row)
    cursorY += rowHeight
  }

  return currentPageNumber
}

function getPageConfig(pdf: PdfDocument): PageConfig {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const marginX = 40
  const startY = 132
  const marginBottom = 44

  return {
    contentWidth: pageWidth - marginX * 2,
    marginBottom,
    marginX,
    pageHeight,
    pageWidth,
    startY,
  }
}

function startPage(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  sectionTitle: string,
  sectionSubtitle: string,
  pageNumber: number
) {
  if (pageNumber > 1) {
    pdf.addPage()
  }

  drawPageFrame(pdf, metadata, pageConfig, sectionTitle, sectionSubtitle, pageNumber)

  return pageConfig.startY
}

function drawPageFrame(
  pdf: PdfDocument,
  metadata: ReportMetadata,
  pageConfig: PageConfig,
  sectionTitle: string,
  sectionSubtitle: string,
  pageNumber: number
) {
  pdf.setFillColor(248, 250, 252)
  pdf.rect(0, 0, pageConfig.pageWidth, 94, "F")

  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(1)
  pdf.line(
    pageConfig.marginX,
    94,
    pageConfig.pageWidth - pageConfig.marginX,
    94
  )

  pdf.setTextColor(15, 23, 42)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(20)
  pdf.text("Painel gerencial", pageConfig.marginX, 38)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Empresa: ${metadata.companyLabel}`, pageConfig.marginX, 58)
  pdf.text(`Periodo: ${metadata.periodSummary}`, pageConfig.marginX, 73)
  pdf.text(
    `Gerado em: ${metadata.generatedAt}`,
    pageConfig.pageWidth - pageConfig.marginX,
    58,
    { align: "right" }
  )
  pdf.text(`Pagina ${pageNumber}`, pageConfig.pageWidth - pageConfig.marginX, 73, {
    align: "right",
  })

  pdf.setTextColor(17, 24, 39)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(16)
  pdf.text(sectionTitle, pageConfig.marginX, 112)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  pdf.setTextColor(100, 116, 139)
  pdf.text(sectionSubtitle, pageConfig.marginX, 126)
}

function drawMetaGrid(
  pdf: PdfDocument,
  pageConfig: PageConfig,
  cursorY: number,
  metadata: ReportMetadata
) {
  const gap = 12
  const boxWidth = (pageConfig.contentWidth - gap) / 2

  drawInfoBox(
    pdf,
    pageConfig.marginX,
    cursorY,
    boxWidth,
    58,
    "Empresa",
    metadata.companyLabel
  )
  drawInfoBox(
    pdf,
    pageConfig.marginX + boxWidth + gap,
    cursorY,
    boxWidth,
    58,
    "Periodo",
    metadata.periodSummary
  )

  return cursorY + 58
}

function drawInfoBox(
  pdf: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string
) {
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(x, y, width, height, 10, 10, "FD")

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139)
  pdf.text(label.toUpperCase(), x + 14, y + 18)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(12)
  pdf.setTextColor(15, 23, 42)
  pdf.text(ellipsizeText(pdf, value, width - 28), x + 14, y + 38)
}

function drawMetricCard(
  pdf: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  metric: AnalyticsMetric
) {
  pdf.setFillColor(255, 255, 255)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(x, y, width, height, 10, 10, "FD")

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(11)
  pdf.setTextColor(30, 41, 59)
  pdf.text(metric.label, x + 14, y + 22)

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(22)
  const metricColor = getMetricColor(metric.type)

  pdf.setTextColor(metricColor[0], metricColor[1], metricColor[2])
  pdf.text(metric.data, x + 14, y + 50)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139)

  const subtitleLines = pdf.splitTextToSize(metric.subtitle, width - 28)
  pdf.text(subtitleLines.slice(0, 2), x + 14, y + 70)
}

function drawSummaryCards(
  pdf: PdfDocument,
  pageConfig: PageConfig,
  cursorY: number,
  cards: Array<{ label: string; value: string }>
) {
  const gap = 10
  const cardWidth =
    (pageConfig.contentWidth - gap * (cards.length - 1)) / cards.length

  cards.forEach((card, index) => {
    const x = pageConfig.marginX + index * (cardWidth + gap)

    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(226, 232, 240)
    pdf.roundedRect(x, cursorY, cardWidth, 54, 10, 10, "FD")

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(100, 116, 139)
    pdf.text(card.label.toUpperCase(), x + 12, cursorY + 18)

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(13)
    pdf.setTextColor(15, 23, 42)
    pdf.text(ellipsizeText(pdf, card.value, cardWidth - 24), x + 12, cursorY + 38)
  })

  return cursorY + 54
}

function drawEmptyState(
  pdf: PdfDocument,
  pageConfig: PageConfig,
  cursorY: number,
  message: string
) {
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(pageConfig.marginX, cursorY, pageConfig.contentWidth, 64, 10, 10, "FD")

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(11)
  pdf.setTextColor(100, 116, 139)
  pdf.text(message, pageConfig.marginX + 16, cursorY + 36)
}

function drawTableHeader(
  pdf: PdfDocument,
  pageConfig: PageConfig,
  cursorY: number,
  columns: Array<{
    align: "left" | "right"
    key: string
    label: string
    width: number
  }>
) {
  pdf.setFillColor(241, 245, 249)
  pdf.rect(pageConfig.marginX, cursorY, pageConfig.contentWidth, 24, "F")

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(10)
  pdf.setTextColor(51, 65, 85)

  let currentX = pageConfig.marginX

  columns.forEach((column) => {
    const textX =
      column.align === "right" ? currentX + column.width - 8 : currentX + 8

    pdf.text(column.label, textX, cursorY + 16, {
      align: column.align === "right" ? "right" : "left",
    })
    currentX += column.width
  })

  return cursorY + 24
}

function drawTableRow(
  pdf: PdfDocument,
  pageConfig: PageConfig,
  cursorY: number,
  columns: Array<{
    align: "left" | "right"
    key: string
    label: string
    width: number
  }>,
  row: Record<string, string>
) {
  pdf.setDrawColor(226, 232, 240)
  pdf.line(
    pageConfig.marginX,
    cursorY + 22,
    pageConfig.marginX + pageConfig.contentWidth,
    cursorY + 22
  )

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)

  let currentX = pageConfig.marginX

  columns.forEach((column) => {
    const rawValue = row[column.key] ?? ""
    const value = ellipsizeText(pdf, rawValue, column.width - 16)
    const textX =
      column.align === "right" ? currentX + column.width - 8 : currentX + 8

    const cellColor = getCellColor(column.key, rawValue)

    pdf.setTextColor(cellColor[0], cellColor[1], cellColor[2])
    pdf.text(value, textX, cursorY + 15, {
      align: column.align === "right" ? "right" : "left",
    })
    currentX += column.width
  })
}

function getCellColor(columnKey: string, value: string) {
  if (columnKey !== "balance") {
    return [15, 23, 42] as const
  }

  if (value.trim().startsWith("-")) {
    return [185, 28, 28] as const
  }

  if (value.trim().startsWith("+")) {
    return [21, 128, 61] as const
  }

  return [29, 78, 216] as const
}

function getMetricColor(metricType: AnalyticsMetric["type"]) {
  switch (metricType) {
    case "extra-hours":
      return [21, 128, 61] as const
    case "issues":
      return [185, 28, 28] as const
    case "late":
    case "pending":
      return [161, 98, 7] as const
    case "present":
    default:
      return [29, 78, 216] as const
  }
}

function ellipsizeText(pdf: PdfDocument, value: string, maxWidth: number) {
  if (pdf.getTextWidth(value) <= maxWidth) {
    return value
  }

  let output = value

  while (output.length > 1 && pdf.getTextWidth(`${output}...`) > maxWidth) {
    output = output.slice(0, -1)
  }

  return `${output}...`
}

function formatGeneratedAt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatHours(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
}

function buildFileName(companyLabel: string, periodSummary: string) {
  const safeCompanyLabel = toFileNamePart(companyLabel) || "empresa"
  const safePeriodSummary = toFileNamePart(periodSummary) || "periodo"
  const timestamp = formatFileTimestamp(new Date())

  return `painel-gerencial_${safePeriodSummary}_${safeCompanyLabel}_${timestamp}.pdf`
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
