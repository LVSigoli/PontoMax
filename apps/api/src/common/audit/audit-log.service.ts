import type { Prisma, PrismaClient } from "@prisma/client"

export interface AuditActorSnapshot {
  id: number
  name: string
  email: string
  role: string
}

export interface AuditCompanySnapshot {
  id: number
  name: string
}

export type AuditValue =
  | string
  | number
  | boolean
  | null
  | AuditValue[]
  | { [key: string]: AuditValue }

export interface AuditChange {
  field: string
  before: AuditValue
  after: AuditValue
}

export interface AuditMetadata {
  summary: string
  actor?: AuditActorSnapshot
  company?: AuditCompanySnapshot
  changes?: AuditChange[]
  details?: Record<string, unknown>
}

type AuditClient = PrismaClient | Prisma.TransactionClient

export function buildAuditActor(user: {
  id: number
  fullName: string
  email: string
  role: string
}): AuditActorSnapshot {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
  }
}

export function buildAuditCompany(company: {
  id: number
  name: string
  tradeName?: string | null
}): AuditCompanySnapshot {
  return {
    id: company.id,
    name: company.tradeName?.trim() || company.name,
  }
}

export function buildChangeSet(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: readonly string[]
) {
  return fields.reduce<AuditChange[]>((changes, field) => {
    const previous = normalizeAuditValue(before[field])
    const next = normalizeAuditValue(after[field])

    if (areValuesEqual(previous, next)) {
      return changes
    }

    changes.push({
      field,
      before: previous,
      after: next,
    })

    return changes
  }, [])
}

export function normalizeAuditValue(value: unknown): AuditValue {
  if (value === undefined || value === null) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAuditValue(item))
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, AuditValue>
    >((accumulator, [key, nestedValue]) => {
      accumulator[key] = normalizeAuditValue(nestedValue)
      return accumulator
    }, {})
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  return String(value)
}

export function parseAuditMetadata(value?: string | null): AuditMetadata | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as unknown

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { summary: String(parsed) }
    }

    return parsed as AuditMetadata
  } catch {
    return {
      summary: value,
    }
  }
}

export async function recordAuditLog(
  client: AuditClient,
  params: {
    companyId?: number | null
    actorUserId?: number | null
    entityType: string
    entityId: string | number
    action: string
    metadata?: AuditMetadata | null
  }
) {
  return client.auditLog.create({
    data: {
      companyId: params.companyId ?? null,
      actorUserId: params.actorUserId ?? null,
      entityType: params.entityType,
      entityId: String(params.entityId),
      action: params.action,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  })
}

function areValuesEqual(left: AuditValue, right: AuditValue) {
  return JSON.stringify(left) === JSON.stringify(right)
}
