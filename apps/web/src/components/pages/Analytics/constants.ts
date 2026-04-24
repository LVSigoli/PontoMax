// Types
import type {
  AnalyticsMetric,
  EmployeeHourBalance,
  SolicitationChartItem,
  WorkedHoursItem,
} from "./types"

export const ANALYTICS_METRICS: AnalyticsMetric[] = [
  {
    label: "Funcionarios presentes hoje",
    data: "12/15",
    type: "present",
    subtitle: "Quantidade de funcionarios que ja registraram entrada hoje",
  },
  {
    label: "Horas extras da semana",
    data: "+18h 30 min",
    type: "extra-hours",
    subtitle: "Total acumulado de horas extras da equipe",
  },
  {
    label: "Ajustes com pendencias",
    data: "6 solicitacoes",
    type: "pending",
    subtitle: "Solicitacoes de correcao aguardando aprovacao",
  },
  {
    label: "Inconsistencia de pontos",
    data: "3 registros",
    type: "issues",
    subtitle: "Casos com falta de registros ou jornadas incompletas",
  },
]

export const EMPLOYEE_HOUR_BALANCES: EmployeeHourBalance[] = [
  { id: 1, name: "Lucas Sigoli", balance: "+08h 15min", status: "positive" },
  { id: 2, name: "Lucas Sigoli", balance: "-08h 15min", status: "negative" },
  { id: 3, name: "Lucas Sigoli", balance: "-08h 15min", status: "negative" },
  { id: 4, name: "Lucas Sigoli", balance: "+08h 15min", status: "positive" },
  { id: 5, name: "Lucas Sigoli", balance: "+08h 15min", status: "positive" },
  { id: 6, name: "Lucas Sigoli", balance: "-08h 15min", status: "negative" },
  { id: 7, name: "Lucas Sigoli", balance: "00h 00min", status: "neutral" },
]

export const SOLICITATION_CHART_DATA: SolicitationChartItem[] = [
  { label: "17 Sun", refused: 19, pending: 7, approved: 24 },
  { label: "18 Mon", refused: 10, pending: 15, approved: 21 },
  { label: "19 Tue", refused: 19, pending: 11, approved: 9 },
  { label: "20 Wed", refused: 19, pending: 3, approved: 20 },
  { label: "21 Thu", refused: 16, pending: 8, approved: 20 },
  { label: "22 Fri", refused: 5, pending: 7, approved: 23 },
]

export const WORKED_HOURS_DATA: WorkedHoursItem[] = [
  { label: "Seg", hours: 8.1 },
  { label: "Ter", hours: 8.5 },
  { label: "Qua", hours: 7.7 },
  { label: "Qui", hours: 8.4 },
  { label: "Sex", hours: 7.4 },
]
