import { getDateOnly } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"

export async function getAnalyticsOverview(companyId?: number) {
  const today = getDateOnly(new Date())
  const [
    companyEmployees,
    todayWorkdays,
    pendingAdjustments,
    inconsistentWorkdays,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        companyId,
        isActive: true,
      },
    }),
    prisma.workday.findMany({
      where: {
        companyId,
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
        companyId,
        status: "PENDING",
      },
    }),
    prisma.workday.count({
      where: {
        companyId,
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
    todayWorkdays.reduce((total, workday) => total + workday.workedMinutes, 0) /
    60

  return {
    presentEmployees,
    companyEmployees,
    overtimeMinutes,
    pendingAdjustments,
    inconsistentWorkdays,
    totalWorkedHours,
  }
}
