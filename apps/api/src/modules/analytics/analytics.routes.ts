import { Router } from "express"
import { z } from "zod"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { getDateOnly } from "../../common/utils/date.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"
import { getAnalyticsDashboard } from "./analytics.service.js"
import {
  ANALYTICS_PERIODS,
  DEFAULT_ANALYTICS_PERIOD,
} from "./analytics.types.js"

export const analyticsRouter = Router()

const overviewQuerySchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
})

const dashboardQuerySchema = z.object({
  query: z
    .object({
      companyId: z.coerce.number().int().positive().optional(),
      period: z.enum(ANALYTICS_PERIODS).default(DEFAULT_ANALYTICS_PERIOD),
      from: z.string().date().optional(),
      to: z.string().date().optional(),
    })
    .superRefine((query, context) => {
      if (query.period !== "custom") {
        return
      }

      if (!query.from) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from is required when period=custom.",
          path: ["from"],
        })
      }

      if (!query.to) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "to is required when period=custom.",
          path: ["to"],
        })
      }

      if (query.from && query.to && query.from > query.to) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from must be before or equal to to.",
          path: ["from"],
        })
      }
    }),
})

analyticsRouter.use(
  authenticate,
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN")
)

analyticsRouter.get(
  "/overview",
  validateRequest(overviewQuerySchema),
  asyncHandler(async (request, response) => {
    const today = getDateOnly(new Date())
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )

    const [
      companyEmployees,
      todayWorkdays,
      pendingAdjustments,
      inconsistentWorkdays,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          companyId: companyId ?? undefined,
          isActive: true,
        },
      }),
      prisma.workday.findMany({
        where: {
          companyId: companyId ?? undefined,
          date: today,
        },
        include: {
          timeEntries: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      }),
      prisma.adjustmentRequest.count({
        where: {
          companyId: companyId ?? undefined,
          status: "PENDING",
        },
      }),
      prisma.workday.count({
        where: {
          companyId: companyId ?? undefined,
          status: "INCONSISTENT",
        },
      }),
    ])

    const presentEmployees = todayWorkdays.filter((workday) =>
      workday.timeEntries.some((entry) => entry.kind === "ENTRY")
    ).length
    const overtimeMinutes = todayWorkdays.reduce(
      (total, workday) => total + workday.overtimeMinutes,
      0
    )
    const totalWorkedHours =
      todayWorkdays.reduce(
        (total, workday) => total + workday.workedMinutes,
        0
      ) / 60

    response.json({
      metrics: {
        presentEmployees,
        companyEmployees,
        overtimeMinutes,
        pendingAdjustments,
        inconsistentWorkdays,
        totalWorkedHours,
      },
    })
  })
)

analyticsRouter.get(
  "/dashboard",
  validateRequest(dashboardQuerySchema),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as z.infer<
      typeof dashboardQuerySchema
    >["query"]

    const dashboard = await getAnalyticsDashboard(
      {
        companyId: getOptionalRequestCompanyId(request, query.companyId),
        period: query.period,
        from: query.from,
        to: query.to,
      }
    )

    response.json(dashboard)
  })
)
