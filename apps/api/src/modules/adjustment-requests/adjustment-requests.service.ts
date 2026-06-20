import type { AuthUser } from "../../common/auth/auth.types.js"
import type { AdjustmentRequestStatus } from "../../common/constants/domain-enums.js"

import { recordAuditLog } from "../../common/audit/index.js"
import { AppError } from "../../common/errors/app-error.js"
import { getDateOnly } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { ensureWorkday } from "../time-records/time-records.service.js"
import type { CreateAdjustmentRequestInput } from "./adjustment-requests.schemas.js"
import { serializeAdjustmentWorkday } from "./adjustment-requests.serializer.js"

export async function listAdjustmentRequests(params: {
  actor: AuthUser
  companyId?: number
  status?: AdjustmentRequestStatus
  userId?: number
  from?: string
  to?: string
}) {
  const scope =
    params.actor.role === "EMPLOYEE"
      ? {
          companyId: params.actor.companyId,
          userId: params.actor.id,
        }
      : {
          companyId: params.companyId,
          userId: params.userId,
        }
  const items = await prisma.adjustmentRequest.findMany({
    where: {
      ...scope,
      status: params.status,
      workday: {
        date: {
          gte: params.from ? getDateOnly(params.from) : undefined,
          lte: params.to ? getDateOnly(params.to) : undefined,
        },
      },
    },
    include: {
      requestedBy: true,
      pointAdjustments: true,
      workday: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  })

  return items.map((item) => ({
    ...item,
    workday: item.workday
      ? serializeAdjustmentWorkday(item.workday)
      : item.workday,
  }))
}

export async function createAdjustmentRequest(params: {
  actor: AuthUser
  data: CreateAdjustmentRequestInput
}) {
  const targetUserId = params.data.userId ?? params.actor.id
  const targetUser = await prisma.user.findUniqueOrThrow({
    where: { id: targetUserId },
    select: {
      companyId: true,
      fullName: true,
      id: true,
    },
  })

  assertCanRequestAdjustment(params.actor, targetUser)

  const workday = await ensureWorkday({
    companyId: targetUser.companyId,
    userId: targetUser.id,
    date: params.data.workdayDate,
  })
  const createdRequest = await prisma.adjustmentRequest.create({
    data: {
      companyId: targetUser.companyId,
      userId: targetUser.id,
      workdayId: workday.id,
      justification: params.data.justification,
      status: "PENDING",
      pointAdjustments: {
        create: params.data.records.map((record) => ({
          timeEntryId: record.timeEntryId,
          actionType: record.actionType,
          targetKind: record.targetKind,
          originalRecordedAt: record.originalRecordedAt
            ? new Date(record.originalRecordedAt)
            : null,
          newRecordedAt: record.newRecordedAt
            ? new Date(record.newRecordedAt)
            : null,
          reason: record.reason,
        })),
      },
    },
    include: {
      pointAdjustments: true,
    },
  })
  const updatedWorkday = await prisma.workday.update({
    where: { id: workday.id },
    data: { status: "PENDING_ADJUSTMENT" },
  })

  await recordAuditLog(prisma, {
    companyId: targetUser.companyId,
    actorUserId: params.actor.id,
    entityType: "ADJUSTMENT_REQUEST",
    entityId: createdRequest.id,
    action: "CREATE",
    metadata: {
      summary: "Solicitação de ajuste criada",
      details: {
        workdayId: workday.id,
        workdayDate: workday.date,
        justification: params.data.justification,
        records: params.data.records,
      },
    },
  })

  return {
    ...createdRequest,
    requestedBy: {
      fullName: targetUser.fullName,
    },
    workday: serializeAdjustmentWorkday({
      ...updatedWorkday,
      date: workday.date,
    }),
  }
}

function assertCanRequestAdjustment(
  actor: AuthUser,
  targetUser: { id: number; companyId: number }
) {
  if (actor.role === "EMPLOYEE" && targetUser.id !== actor.id) {
    throw new AppError(
      "You do not have permission to request this adjustment.",
      403
    )
  }

  if (
    actor.role === "COMPANY_ADMIN" &&
    targetUser.companyId !== actor.companyId
  ) {
    throw new AppError(
      "You do not have permission to request this adjustment.",
      403
    )
  }
}
