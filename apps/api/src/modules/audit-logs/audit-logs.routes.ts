import type { Prisma } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import {
  AUDIT_LOG_ACTIONS,
  AUDIT_LOG_ENTITY_TYPES,
} from "../../common/constants/domain-enums.js"
import { parseAuditMetadata } from "../../common/audit/audit-log.service.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"

export const auditLogsRouter = Router()

const listSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    actorUserId: z.coerce.number().int().positive().optional(),
    entityType: z.enum(AUDIT_LOG_ENTITY_TYPES).optional(),
    action: z.enum(AUDIT_LOG_ACTIONS).optional(),
    entityId: z.string().min(1).optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
})

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

type ListQuery = z.infer<typeof listSchema>["query"]

auditLogsRouter.use(authenticate)

auditLogsRouter.get(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as ListQuery
    const companyId = getOptionalRequestCompanyId(
      request,
      query.companyId
    )

    const where: Prisma.AuditLogWhereInput = {
      companyId: companyId ?? undefined,
      actorUserId: query.actorUserId,
      entityType: query.entityType,
      action: query.action,
      entityId: query.entityId,
      createdAt: {
        gte: query.from
          ? startOfDay(query.from)
          : undefined,
        lte: query.to ? endOfDay(query.to) : undefined,
      },
    }

    const [totalItems, auditLogs] = await prisma.$transaction([
      prisma.auditLog.count({
        where,
      }),
      prisma.auditLog.findMany({
        where,
        include: auditLogInclude,
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
        skip: Math.max(0, (query.page - 1) * query.pageSize),
        take: query.pageSize,
      }),
    ])

    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize)

    response.json({
      items: auditLogs.map((auditLog) => {
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
            auditLog.actorUser?.fullName ||
            metadata?.actor?.name ||
            null,
          actorUserEmail:
            auditLog.actorUser?.email ||
            metadata?.actor?.email ||
            null,
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          action: auditLog.action,
          summary:
            metadata?.summary ?? `${auditLog.action} em ${auditLog.entityType}`,
          metadata,
          createdAt: auditLog.createdAt,
        }
      }),
      meta: {
        page: totalPages === 0 ? 1 : Math.min(query.page, totalPages),
        pageSize: query.pageSize,
        totalItems,
        totalPages,
      },
    })
  })
)
