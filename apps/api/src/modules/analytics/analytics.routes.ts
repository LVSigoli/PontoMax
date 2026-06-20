import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { getAnalyticsOverview } from "./analytics-overview.service.js"
import {
  analyticsDashboardSchema,
  analyticsOverviewSchema,
  type AnalyticsDashboardQuery,
} from "./analytics.schemas.js"
import { getAnalyticsDashboard } from "./analytics.service.js"

export const analyticsRouter = Router()

analyticsRouter.use(
  authenticate,
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN")
)

analyticsRouter.get(
  "/overview",
  validateRequest(analyticsOverviewSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )
    response.json({ metrics: await getAnalyticsOverview(companyId) })
  })
)

analyticsRouter.get(
  "/dashboard",
  validateRequest(analyticsDashboardSchema),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as AnalyticsDashboardQuery
    const dashboard = await getAnalyticsDashboard({
      companyId: getOptionalRequestCompanyId(request, query.companyId),
      period: query.period,
      from: query.from,
      to: query.to,
    })

    response.json(dashboard)
  })
)
