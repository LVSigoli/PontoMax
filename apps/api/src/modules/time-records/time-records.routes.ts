import type { Request } from "express"
import { Router } from "express"
import { z } from "zod"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { TIME_ENTRY_KINDS } from "../../common/constants/domain-enums.js"
import { AppError } from "../../common/errors/app-error.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"
import {
  createTimeEntry,
  getTodayWorkdaySnapshot,
  getWorkdayOverview,
  serializeTimeEntry,
  serializeWorkday,
} from "./time-records.service.js"

export const timeRecordsRouter = Router()

const userScopeSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
})

const listSchema = z.object({
  query: userScopeSchema.extend({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
})

const overviewSchema = z.object({
  query: userScopeSchema.extend({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
})

const todaySchema = z.object({
  query: userScopeSchema,
})

const registerSchema = z.object({
  body: z.object({
    recordedAt: z.string().datetime().optional(),
    kind: z.enum(TIME_ENTRY_KINDS).optional(),
    timezone: z.string().optional(),
  }),
})

timeRecordsRouter.use(authenticate)

timeRecordsRouter.get(
  "/overview",
  validateRequest(overviewSchema),
  asyncHandler(async (request, response) => {
    const { user, userId } = await resolveTimeRecordAccess(request)

    const overview = await getWorkdayOverview({
      companyId: user.companyId,
      userId,
      page: Number(request.query.page ?? 1),
      pageSize: Number(request.query.pageSize ?? 20),
      timezone: user.company.timezone,
    })

    response.json(overview)
  })
)

timeRecordsRouter.get(
  "/today",
  validateRequest(todaySchema),
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

timeRecordsRouter.get(
  "/",
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const { userId } = await resolveTimeRecordAccess(request)

    const workdays = await prisma.workday.findMany({
      where: {
        userId,
        date: {
          gte: request.query.from
            ? startOfDay(request.query.from as string)
            : undefined,
          lte: request.query.to ? endOfDay(request.query.to as string) : undefined,
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

timeRecordsRouter.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(async (request, response) => {
    const result = await createTimeEntry({
      companyId: request.authUser!.companyId,
      userId: request.authUser!.id,
      recordedAt: request.body.recordedAt
        ? new Date(request.body.recordedAt)
        : new Date(),
      source: "WEB",
      kind: request.body.kind,
      timezone: request.body.timezone ?? "America/Sao_Paulo",
    })

    response.status(201).json({
      entry: serializeTimeEntry(result.entry),
      workday: serializeWorkday(result.workday),
    })
  })
)

timeRecordsRouter.get(
  "/team/today",
  requireRole("PLATFORM_ADMIN", "CLIENT_ADMIN", "COMPANY_ADMIN", "MANAGER"),
  asyncHandler(async (request, response) => {
    const today = startOfDay(new Date())
    const tomorrow = endOfDay(new Date())
    const companyId = getOptionalRequestCompanyId(request)

    const workdays = await prisma.workday.findMany({
      where: {
        companyId: companyId ?? undefined,
        date: {
          gte: today,
          lte: tomorrow,
        },
      },
      include: {
        user: true,
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
      orderBy: {
        user: {
          fullName: "asc",
        },
      },
    })

    response.json({
      items: workdays.map((workday) => ({
        userId: workday.userId,
        userName: workday.user.fullName,
        status: workday.status,
        workedMinutes: workday.workedMinutes,
        lastEntryAt: workday.timeEntries.at(-1)?.recordedAt ?? null,
      })),
    })
  })
)

async function resolveTimeRecordAccess(request: Request) {
  const requestedUserId = request.query.userId ? Number(request.query.userId) : undefined
  const userId = requestedUserId ?? request.authUser!.id

  if (
    requestedUserId &&
    requestedUserId !== request.authUser!.id &&
    !["PLATFORM_ADMIN", "CLIENT_ADMIN", "COMPANY_ADMIN", "MANAGER"].includes(
      request.authUser!.role
    )
  ) {
    throw new AppError(
      "You do not have permission to access records from another user.",
      403
    )
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      company: true,
    },
  })

  if (
    request.authUser!.role !== "PLATFORM_ADMIN" &&
    user.companyId !== request.authUser!.companyId
  ) {
    throw new AppError(
      "You do not have permission to access these records.",
      403
    )
  }

  return {
    user,
    userId,
  }
}
