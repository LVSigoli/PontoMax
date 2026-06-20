import { Router } from "express"

import { asyncHandler } from "../../common/utils/async-handler.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"
import { resolveTimeRecordAccess } from "./time-records.access.js"
import {
  listTimeRecordsSchema,
  todayWorkdaySchema,
  workdayOverviewSchema,
  workdaySummarySchema,
} from "./time-records.schemas.js"
import {
  getTodayWorkdaySnapshot,
  getUserWorkdaySummary,
  getWorkdayOverview,
  serializeWorkday,
} from "./time-records.service.js"

export const userTimeRecordsRouter = Router()

userTimeRecordsRouter.get(
  "/overview",
  validateRequest(workdayOverviewSchema),
  asyncHandler(async (request, response) => {
    const { user, userId } = await resolveTimeRecordAccess(request)

    const overview = await getWorkdayOverview({
      companyId: user.companyId,
      from: request.query.from as string | undefined,
      userId,
      page: Number(request.query.page ?? 1),
      pageSize: Number(request.query.pageSize ?? 20),
      timezone: user.company.timezone,
      to: request.query.to as string | undefined,
    })

    response.json(overview)
  })
)

userTimeRecordsRouter.get(
  "/today",
  validateRequest(todayWorkdaySchema),
  asyncHandler(async (request, response) => {
    const { user, userId } = await resolveTimeRecordAccess(request)

    const item = await getTodayWorkdaySnapshot({
      companyId: user.companyId,
      userId,
      timezone: user.company.timezone,
    })

    response.json({ item })
  })
)

userTimeRecordsRouter.get(
  "/summary",
  validateRequest(workdaySummarySchema),
  asyncHandler(async (request, response) => {
    const { user, userId } = await resolveTimeRecordAccess(request)

    const summary = await getUserWorkdaySummary({
      companyId: user.companyId,
      from: request.query.from as string | undefined,
      userId,
      timezone: user.company.timezone,
      to: request.query.to as string | undefined,
    })

    response.json({ summary })
  })
)

userTimeRecordsRouter.get(
  "/",
  validateRequest(listTimeRecordsSchema),
  asyncHandler(async (request, response) => {
    const { userId } = await resolveTimeRecordAccess(request)

    const workdays = await prisma.workday.findMany({
      where: {
        userId,
        date: {
          gte: request.query.from
            ? startOfDay(request.query.from as string)
            : undefined,
          lte: request.query.to
            ? endOfDay(request.query.to as string)
            : undefined,
        },
      },
      include: {
        timeEntries: {
          orderBy: {
            recordedAt: "desc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    response.json({
      items: workdays.map(serializeWorkday),
    })
  })
)
