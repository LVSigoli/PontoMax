import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  listAuditLogsSchema,
  type ListAuditLogsQuery,
} from "./audit-logs.schemas.js"
import { listAuditLogs } from "./audit-logs.service.js"

export const auditLogsRouter = Router()

auditLogsRouter.use(authenticate)

auditLogsRouter.get(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(listAuditLogsSchema),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as ListAuditLogsQuery
    const companyId = getOptionalRequestCompanyId(request, query.companyId)
    response.json(await listAuditLogs(query, companyId))
  })
)
