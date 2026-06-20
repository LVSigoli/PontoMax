import { Router } from "express"

import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"

export const teamTimeRecordsRouter = Router()

teamTimeRecordsRouter.get(
  "/team/today",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
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
