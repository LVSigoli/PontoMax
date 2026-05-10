import type { AuditLogApiItem } from "@/services/domain"
import type { TableRowData } from "@/components/structure/Table/types"
import type { SelectionOption } from "@/components/structure/Select/types"

export const ALL_OPTION_VALUE = "__all__"

export const AUDIT_ENTITY_OPTIONS: SelectionOption[] = [
  { value: ALL_OPTION_VALUE, label: "Todas as entidades" },
  { value: "AUTH", label: "Autenticacao" },
  { value: "USER", label: "Usuarios" },
  { value: "COMPANY", label: "Empresas" },
  { value: "JOURNEY", label: "Jornadas" },
  { value: "HOLIDAY", label: "Feriados" },
  { value: "TIME_RECORD", label: "Pontos" },
  { value: "ADJUSTMENT_REQUEST", label: "Ajustes" },
]

export const AUDIT_ACTION_OPTIONS: SelectionOption[] = [
  { value: ALL_OPTION_VALUE, label: "Todas as acoes" },
  { value: "CREATE", label: "Criar" },
  { value: "UPDATE", label: "Atualizar" },
  { value: "DELETE", label: "Excluir" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "RESET_PASSWORD", label: "Redefinir senha" },
  { value: "REGISTER", label: "Registrar ponto" },
  { value: "APPROVE", label: "Aprovar" },
  { value: "REJECT", label: "Rejeitar" },
]

export const AUDIT_PAGE_SIZE_OPTIONS: SelectionOption[] = [
  { value: "20", label: "20 por pagina" },
  { value: "50", label: "50 por pagina" },
  { value: "100", label: "100 por pagina" },
]

export const ALL_COMPANIES_LABEL = "Todas as empresas"
export const ALL_ACTORS_LABEL = "Todos os autores"
export const ALL_ENTITY_LABEL = "Todas as entidades"
export const ALL_ACTION_LABEL = "Todas as acoes"

export function buildAuditTableData(items: AuditLogApiItem[]) {
  return items.map<TableRowData>((item) => ({
    ID: {
      value: String(item.id),
      className: "font-mono text-xs text-content-muted",
    },
    Data: {
      value: formatAuditDate(item.createdAt),
    },
    Empresa: {
      value: item.companyName,
    },
    Autor: {
      value: item.actorUserName ?? item.actorUserEmail ?? "Sistema",
    },
    Entidade: {
      value: getAuditEntityLabel(item.entityType),
      type: "badge",
      color: "bg-info-50 text-info-700",
    },
    Ação: {
      value: getAuditActionLabel(item.action),
      type: "badge",
      color: getAuditActionColor(item.action),
    },
    Alvo: {
      value: item.entityId,
      className: "font-mono text-xs text-content-muted",
    },
    Resumo: {
      value: item.summary,
    },
  }))
}

export function getAuditRowId(row: TableRowData) {
  const rowId = row.ID?.value

  return typeof rowId === "string" ? Number(rowId) : Number.NaN
}

export function formatAuditDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

export function buildAuditMetadataText(metadata: unknown) {
  if (!metadata) return ""

  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return String(metadata)
  }
}

export function getAuditEntityLabel(entityType: string) {
  const entry = AUDIT_ENTITY_OPTIONS.find((option) => option.value === entityType)

  return entry?.label ?? entityType
}

export function getAuditActionLabel(action: string) {
  const entry = AUDIT_ACTION_OPTIONS.find((option) => option.value === action)

  return entry?.label ?? action
}

export function getAuditActionColor(action: string) {
  if (action === "DELETE" || action === "REJECT") {
    return "bg-danger-50 text-danger-700"
  }

  if (action === "UPDATE") {
    return "bg-info-50 text-info-700"
  }

  if (action === "LOGOUT" || action === "RESET_PASSWORD") {
    return "bg-warning-50 text-warning-700"
  }

  return "bg-success-50 text-success-700"
}
