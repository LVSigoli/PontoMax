import { z } from "zod"

import {
  AUDIT_LOG_ACTIONS,
  AUDIT_LOG_ENTITY_TYPES,
} from "../../common/constants/domain-enums.js"

export const listAuditLogsSchema = z.object({
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

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsSchema>["query"]
