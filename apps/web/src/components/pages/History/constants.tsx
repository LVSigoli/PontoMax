// Types
import type { TableAction } from "@/components/structure/Table/types"
import type { SolicitationHistoryItem, UserAnalysisItem } from "./types"

export const USER_ANALYSIS: UserAnalysisItem[] = [
  {
    label: "Dias trabalhados",
    data: "12 dias",
    type: "worked-days",
    subtitle: "Quantidade de dias trabalhados este mes ate o momento",
  },
  {
    label: "Saldo de horas",
    data: "+2 h 0 min",
    type: "hour-balance",
    subtitle: "Total acumulado de horas extras do funcionario",
  },
  {
    label: "Ajustes pendentes",
    data: "6 solicitacoes",
    type: "pending",
    subtitle: "Solicitacoes de correcao aguardando aprovacao",
  },
  {
    label: "Inconsistencias",
    data: "3 registros",
    type: "issues",
    subtitle: "Casos como falta de registros ou jornadas incompletas",
  },
]

export const SOLICITATION_HISTORY: SolicitationHistoryItem[] = [
  {
    id: 1,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Inconsistente",
  },
  {
    id: 2,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 3,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 4,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 5,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 6,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 7,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Recusado",
  },
  {
    id: 8,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 9,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Registrado",
  },
  {
    id: 10,
    lastSolicitationTime: "08h e 00 min",
    extraHours: "08h e 00 min",
    missingHours: "08h e 00 min",
    status: "Recusado",
  },
]

export const SOLICITATION_ACTIONS: TableAction[] = [
  {
    id: "details",
    label: "Detalhes",
    color: "text-content-secondary",
    icon: <span className="text-xs font-bold leading-none">i</span>,
  },
]
