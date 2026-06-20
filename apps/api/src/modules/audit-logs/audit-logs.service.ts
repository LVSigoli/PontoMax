import type { Prisma } from "@prisma/client"

import { parseAuditMetadata } from "../../common/audit/audit-log.service.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import type { ListAuditLogsQuery } from "./audit-logs.schemas.js"

const auditLogInclude = {
  company: {
    select: {
      id: true,
      name: true,
      tradeName: true,
    },
  },
  actorUser: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogInclude

export async function listAuditLogs(
  query: ListAuditLogsQuery,
  companyId?: number
) {
  const where: Prisma.AuditLogWhereInput = {
    companyId,
    actorUserId: query.actorUserId,
    entityType: query.entityType,
    action: query.action,
    entityId: query.entityId,
    createdAt: {
      gte: query.from ? startOfDay(query.from) : undefined,
      lte: query.to ? endOfDay(query.to) : undefined,
    },
  }

  const [totalItems, auditLogs] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: auditLogInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: Math.max(0, (query.page - 1) * query.pageSize),
      take: query.pageSize,
    }),
  ])
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize)

  return {
    items: auditLogs.map(serializeAuditLog),
    meta: {
      page: totalPages === 0 ? 1 : Math.min(query.page, totalPages),
      pageSize: query.pageSize,
      totalItems,
      totalPages,
    },
  }
}

function serializeAuditLog(
  auditLog: Prisma.AuditLogGetPayload<{ include: typeof auditLogInclude }>
) {
  const metadata = parseAuditMetadata(auditLog.metadata)

  return {
    id: auditLog.id,
    companyId: auditLog.companyId,
    companyName:
      auditLog.company?.tradeName?.trim() ||
      auditLog.company?.name ||
      metadata?.company?.name ||
      "Global",
    actorUserId: auditLog.actorUserId,
    actorUserName:
      auditLog.actorUser?.fullName || metadata?.actor?.name || null,
    actorUserEmail: auditLog.actorUser?.email || metadata?.actor?.email || null,
    entityType: auditLog.entityType,
    entityId: auditLog.entityId,
    action: auditLog.action,
    summary:
      metadata?.summary ?? `${auditLog.action} em ${auditLog.entityType}`,
    metadata,
    createdAt: auditLog.createdAt,
  }
}
