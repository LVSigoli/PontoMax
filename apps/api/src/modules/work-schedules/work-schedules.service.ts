import { buildChangeSet, recordAuditLog } from "../../common/audit/index.js"
import { AppError } from "../../common/errors/app-error.js"
import { parseTimeStringToDate } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { journeyAuditSnapshot } from "./work-schedules.serializer.js"

export async function listWorkSchedules(companyId?: number) {
  const journeys = await prisma.journey.findMany({
    where: { companyId },
    include: {
      _count: {
        select: {
          userAssignments: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return journeys.map((journey) => ({
    ...journey,
    employees: journey._count.userAssignments,
  }))
}

export async function createWorkSchedule(params: {
  companyId: number
  actorUserId: number
  data: {
    name: string
    description?: string
    scaleCode: string
    flexibleSchedule?: boolean
    dailyWorkMinutes: number
    weeklyWorkMinutes?: number
    expectedEntryTime?: string | null
    expectedExitTime?: string | null
    breakMinutes?: number
    toleranceMinutes?: number
    nightShift?: boolean
    isActive?: boolean
  }
}) {
  const journey = await prisma.journey.create({
    data: {
      companyId: params.companyId,
      name: params.data.name,
      description: params.data.description,
      scaleCode: params.data.scaleCode,
      flexibleSchedule: params.data.flexibleSchedule ?? false,
      dailyWorkMinutes: params.data.dailyWorkMinutes,
      weeklyWorkMinutes: params.data.weeklyWorkMinutes,
      expectedEntryTime: parseTimeStringToDate(params.data.expectedEntryTime),
      expectedExitTime: parseTimeStringToDate(params.data.expectedExitTime),
      breakMinutes: params.data.breakMinutes ?? 60,
      toleranceMinutes: params.data.toleranceMinutes ?? 10,
      nightShift: params.data.nightShift ?? false,
      isActive: params.data.isActive ?? true,
    },
  })

  await recordAuditLog(prisma, {
    companyId: params.companyId,
    actorUserId: params.actorUserId,
    entityType: "JOURNEY",
    entityId: journey.id,
    action: "CREATE",
    metadata: {
      summary: "Jornada criada",
      details: {
        after: journeyAuditSnapshot(journey),
      },
    },
  })

  return journey
}

export async function updateWorkSchedule(params: {
  journeyId: number
  role: string
  authCompanyId: number
  actorUserId: number
  data: {
    companyId?: number
    name?: string
    description?: string
    scaleCode?: string
    flexibleSchedule?: boolean
    dailyWorkMinutes?: number
    weeklyWorkMinutes?: number
    expectedEntryTime?: string | null
    expectedExitTime?: string | null
    breakMinutes?: number
    toleranceMinutes?: number
    nightShift?: boolean
    isActive?: boolean
  }
}) {
  const currentJourney = await prisma.journey.findUniqueOrThrow({
    where: { id: params.journeyId },
  })

  assertJourneyAccess(
    params.role,
    params.authCompanyId,
    currentJourney.companyId,
    "update"
  )

  const journey = await prisma.journey.update({
    where: { id: params.journeyId },
    data: {
      ...params.data,
      expectedEntryTime:
        params.data.expectedEntryTime === undefined
          ? undefined
          : parseTimeStringToDate(params.data.expectedEntryTime),
      expectedExitTime:
        params.data.expectedExitTime === undefined
          ? undefined
          : parseTimeStringToDate(params.data.expectedExitTime),
    },
  })

  await recordAuditLog(prisma, {
    companyId: journey.companyId,
    actorUserId: params.actorUserId,
    entityType: "JOURNEY",
    entityId: journey.id,
    action: "UPDATE",
    metadata: {
      summary: "Jornada atualizada",
      changes: buildChangeSet(
        journeyAuditSnapshot(currentJourney),
        journeyAuditSnapshot(journey),
        [
          "companyId",
          "name",
          "description",
          "scaleCode",
          "flexibleSchedule",
          "dailyWorkMinutes",
          "weeklyWorkMinutes",
          "expectedEntryTime",
          "expectedExitTime",
          "breakMinutes",
          "toleranceMinutes",
          "nightShift",
          "isActive",
        ]
      ),
    },
  })

  return journey
}

export async function deleteWorkSchedule(params: {
  journeyId: number
  role: string
  authCompanyId: number
  actorUserId: number
}) {
  const currentJourney = await prisma.journey.findUniqueOrThrow({
    where: { id: params.journeyId },
  })

  assertJourneyAccess(
    params.role,
    params.authCompanyId,
    currentJourney.companyId,
    "remove"
  )

  await prisma.journey.delete({
    where: { id: params.journeyId },
  })

  await recordAuditLog(prisma, {
    companyId: currentJourney.companyId,
    actorUserId: params.actorUserId,
    entityType: "JOURNEY",
    entityId: currentJourney.id,
    action: "DELETE",
    metadata: {
      summary: "Jornada removida",
      details: {
        before: journeyAuditSnapshot(currentJourney),
      },
    },
  })
}

function assertJourneyAccess(
  role: string,
  authCompanyId: number,
  journeyCompanyId: number,
  action: "update" | "remove"
) {
  if (role !== "PLATFORM_ADMIN" && journeyCompanyId !== authCompanyId) {
    throw new AppError(
      `You do not have permission to ${action} this journey.`,
      403
    )
  }
}
