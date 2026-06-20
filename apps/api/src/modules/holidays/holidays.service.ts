import type { Prisma } from "@prisma/client"

import { buildChangeSet, recordAuditLog } from "../../common/audit/index.js"
import { AppError } from "../../common/errors/app-error.js"
import { getDateOnly } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { recalculateWorkday } from "../time-records/time-records.service.js"
import type {
  CreateHolidayInput,
  UpdateHolidayInput,
} from "./holidays.schemas.js"
import { serializeHoliday, toHolidayScope } from "./holidays.serializer.js"
import {
  holidayInclude,
  type HolidayScope,
  type HolidayWithCompanies,
} from "./holidays.types.js"

export async function listHolidays(params: {
  companyId?: number
  year?: number
}) {
  const where: Prisma.HolidayWhereInput = {
    date:
      params.year === undefined
        ? undefined
        : {
            gte: new Date(`${params.year}-01-01T00:00:00.000Z`),
            lte: new Date(`${params.year}-12-31T00:00:00.000Z`),
          },
    ...(params.companyId
      ? {
          OR: [
            { type: "NATIONAL" },
            {
              companyAssignments: {
                some: { companyId: params.companyId },
              },
            },
          ],
        }
      : {}),
  }

  const holidays = await prisma.holiday.findMany({
    where,
    include: holidayInclude,
    orderBy: [{ date: "asc" }, { name: "asc" }],
  })

  return holidays.map(serializeHoliday)
}

export async function createHoliday(params: {
  data: CreateHolidayInput
  role: string
  authCompanyId: number
  actorUserId: number
}) {
  const companyIds = await resolveHolidayCompanyIds(
    params.role,
    params.authCompanyId,
    params.data.type,
    params.data.companyIds
  )
  const holidayDate = getDateOnly(params.data.date)
  const holiday = await prisma.holiday.create({
    data: {
      name: params.data.name,
      date: holidayDate,
      type: params.data.type,
      isActive: params.data.isActive ?? true,
      companyAssignments: companyIds.length
        ? {
            create: companyIds.map((companyId) => ({ companyId })),
          }
        : undefined,
    },
    include: holidayInclude,
  })

  await refreshHolidayWorkdays([
    { date: holidayDate, type: params.data.type, companyIds },
  ])
  await recordAuditLog(prisma, {
    companyId: companyIds[0] ?? null,
    actorUserId: params.actorUserId,
    entityType: "HOLIDAY",
    entityId: holiday.id,
    action: "CREATE",
    metadata: {
      summary: "Feriado criado",
      details: { after: serializeHoliday(holiday) },
    },
  })

  return serializeHoliday(holiday)
}

export async function updateHoliday(params: {
  holidayId: number
  data: UpdateHolidayInput
  role: string
  authCompanyId: number
  actorUserId: number
}) {
  const currentHoliday = await prisma.holiday.findUniqueOrThrow({
    where: { id: params.holidayId },
    include: holidayInclude,
  })
  assertHolidayManagementPermission(
    params.role,
    params.authCompanyId,
    currentHoliday
  )

  const currentCompanyIds = currentHoliday.companyAssignments.map(
    (assignment) => assignment.companyId
  )
  const nextType = params.data.type ?? currentHoliday.type
  const nextCompanyIds =
    params.data.companyIds ?? (nextType === "NATIONAL" ? [] : currentCompanyIds)
  const resolvedCompanyIds = await resolveHolidayCompanyIds(
    params.role,
    params.authCompanyId,
    nextType,
    nextCompanyIds
  )
  const shouldReplaceCompanyAssignments =
    params.data.type !== undefined || params.data.companyIds !== undefined

  const holiday = await prisma.holiday.update({
    where: { id: params.holidayId },
    data: {
      name: params.data.name,
      date: params.data.date ? getDateOnly(params.data.date) : undefined,
      type: params.data.type,
      isActive: params.data.isActive,
      companyAssignments: shouldReplaceCompanyAssignments
        ? {
            deleteMany: {},
            ...(resolvedCompanyIds.length
              ? {
                  create: resolvedCompanyIds.map((companyId) => ({
                    companyId,
                  })),
                }
              : {}),
          }
        : undefined,
    },
    include: holidayInclude,
  })

  await refreshHolidayWorkdays([
    toHolidayScope(currentHoliday),
    toHolidayScope(holiday),
  ])
  await recordAuditLog(prisma, {
    companyId:
      resolvedCompanyIds[0] ??
      currentHoliday.companyAssignments[0]?.companyId ??
      null,
    actorUserId: params.actorUserId,
    entityType: "HOLIDAY",
    entityId: holiday.id,
    action: "UPDATE",
    metadata: {
      summary: "Feriado atualizado",
      changes: buildChangeSet(
        holidayAuditSnapshot(currentHoliday),
        holidayAuditSnapshot(holiday),
        ["name", "date", "type", "isActive", "companyIds"]
      ),
      details: {
        before: serializeHoliday(currentHoliday),
        after: serializeHoliday(holiday),
      },
    },
  })

  return serializeHoliday(holiday)
}

export async function deleteHoliday(params: {
  holidayId: number
  role: string
  authCompanyId: number
  actorUserId: number
}) {
  const currentHoliday = await prisma.holiday.findUniqueOrThrow({
    where: { id: params.holidayId },
    include: holidayInclude,
  })
  assertHolidayManagementPermission(
    params.role,
    params.authCompanyId,
    currentHoliday
  )

  await prisma.holiday.delete({ where: { id: params.holidayId } })
  await refreshHolidayWorkdays([toHolidayScope(currentHoliday)])
  await recordAuditLog(prisma, {
    companyId: currentHoliday.companyAssignments[0]?.companyId ?? null,
    actorUserId: params.actorUserId,
    entityType: "HOLIDAY",
    entityId: currentHoliday.id,
    action: "DELETE",
    metadata: {
      summary: "Feriado removido",
      details: { before: serializeHoliday(currentHoliday) },
    },
  })
}

async function refreshHolidayWorkdays(scopes: HolidayScope[]) {
  const workdayIds = new Set<number>()

  for (const scope of scopes) {
    if (scope.type !== "NATIONAL" && scope.companyIds.length === 0) continue

    const workdays = await prisma.workday.findMany({
      where: {
        date: scope.date,
        ...(scope.type === "NATIONAL"
          ? {}
          : { companyId: { in: scope.companyIds } }),
      },
      select: { id: true },
    })

    for (const workday of workdays) workdayIds.add(workday.id)
  }

  await Promise.all(
    [...workdayIds].map((workdayId) => recalculateWorkday(workdayId))
  )
}

async function resolveHolidayCompanyIds(
  role: string,
  authCompanyId: number,
  type: string,
  requestedCompanyIds?: number[]
) {
  const companyIds = normalizeCompanyIds(requestedCompanyIds)

  if (type === "NATIONAL") {
    if (role !== "PLATFORM_ADMIN") {
      throw new AppError(
        "Only platform administrators can manage national holidays.",
        403
      )
    }
    if (companyIds.length > 0) {
      throw new AppError(
        "National holidays apply to all companies and must not receive companyIds.",
        400
      )
    }
    return []
  }

  if (companyIds.length === 0) {
    throw new AppError(
      "At least one company must be selected for this holiday.",
      400
    )
  }

  if (role !== "PLATFORM_ADMIN") {
    if (companyIds.length !== 1 || companyIds[0] !== authCompanyId) {
      throw new AppError(
        "You do not have permission to assign this holiday to the selected companies.",
        403
      )
    }
    return [authCompanyId]
  }

  const totalCompanies = await prisma.company.count({
    where: { id: { in: companyIds } },
  })
  if (totalCompanies !== companyIds.length) {
    throw new AppError("One or more selected companies were not found.", 400)
  }

  return companyIds
}

function assertHolidayManagementPermission(
  role: string,
  authCompanyId: number,
  holiday: HolidayWithCompanies
) {
  if (role === "PLATFORM_ADMIN") return
  if (holiday.type === "NATIONAL") {
    throw new AppError(
      "Only platform administrators can manage national holidays.",
      403
    )
  }

  const scopedCompanyIds = holiday.companyAssignments.map(
    (assignment) => assignment.companyId
  )
  if (scopedCompanyIds.length !== 1 || scopedCompanyIds[0] !== authCompanyId) {
    throw new AppError(
      "You do not have permission to manage this holiday.",
      403
    )
  }
}

function normalizeCompanyIds(companyIds?: number[]) {
  return [...new Set((companyIds ?? []).map(Number).filter(Boolean))]
}

function holidayAuditSnapshot(holiday: HolidayWithCompanies) {
  return {
    name: holiday.name,
    date: holiday.date,
    type: holiday.type,
    isActive: holiday.isActive,
    companyIds: holiday.companyAssignments
      .map((assignment) => assignment.companyId)
      .sort((left, right) => left - right),
  }
}
