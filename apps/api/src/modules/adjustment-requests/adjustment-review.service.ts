import type { AuthUser } from "../../common/auth/auth.types.js"

import { recordAuditLog } from "../../common/audit/index.js"
import { toTimeEntryKind } from "../../common/constants/domain-enums.js"
import { AppError } from "../../common/errors/app-error.js"
import { isAlternatingTimeEntrySequence } from "../../common/utils/time-records.js"
import { prisma } from "../../lib/prisma.js"
import { recalculateWorkday } from "../time-records/time-records.service.js"
import { serializeAdjustmentWorkday } from "./adjustment-requests.serializer.js"

export async function reviewAdjustmentRequest(params: {
  requestId: number
  status: "APPROVED" | "REJECTED"
  reviewNotes?: string
  actor: AuthUser
}) {
  const adjustmentRequest = await prisma.adjustmentRequest.findUniqueOrThrow({
    where: { id: params.requestId },
    include: {
      pointAdjustments: true,
      workday: true,
    },
  })

  if (
    params.actor.role !== "PLATFORM_ADMIN" &&
    adjustmentRequest.companyId !== params.actor.companyId
  ) {
    throw new AppError(
      "You do not have permission to review this request.",
      403
    )
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.adjustmentRequest.update({
      where: { id: adjustmentRequest.id },
      data: {
        status: params.status,
        reviewNotes: params.reviewNotes,
        reviewedById: params.actor.id,
        reviewedAt: new Date(),
      },
    })

    if (params.status === "REJECTED") {
      await transaction.workday.update({
        where: { id: adjustmentRequest.workdayId },
        data: { status: "REJECTED" },
      })
      return
    }

    for (const adjustment of adjustmentRequest.pointAdjustments) {
      await applyPointAdjustment(transaction, adjustmentRequest, adjustment)
    }

    const activeTimeEntries = await transaction.timeEntry.findMany({
      where: {
        workdayId: adjustmentRequest.workdayId,
        status: "ACTIVE",
      },
      orderBy: [{ recordedAt: "asc" }, { sequence: "asc" }],
    })
    const normalizedEntries = activeTimeEntries.map((entry) => ({
      kind: toTimeEntryKind(entry.kind),
      recordedAt: entry.recordedAt,
      sequence: entry.sequence,
    }))

    if (!isAlternatingTimeEntrySequence(normalizedEntries)) {
      throw new AppError(
        "The approved adjustment would create an invalid time entry sequence.",
        400
      )
    }
  })

  if (params.status === "APPROVED") {
    await recalculateWorkday(adjustmentRequest.workdayId)
  }

  const workday = await prisma.workday.update({
    where: { id: adjustmentRequest.workdayId },
    data: {
      status: params.status === "APPROVED" ? "ADJUSTED" : "REJECTED",
    },
    include: {
      timeEntries: {
        where: { status: "ACTIVE" },
        orderBy: { recordedAt: "asc" },
      },
    },
  })

  await recordAuditLog(prisma, {
    companyId: adjustmentRequest.companyId,
    actorUserId: params.actor.id,
    entityType: "ADJUSTMENT_REQUEST",
    entityId: adjustmentRequest.id,
    action: params.status === "APPROVED" ? "APPROVE" : "REJECT",
    metadata: {
      summary:
        params.status === "APPROVED"
          ? "Solicitação de ajuste aprovada"
          : "Solicitação de ajuste recusada",
      details: {
        status: params.status,
        reviewNotes: params.reviewNotes ?? null,
        workdayId: adjustmentRequest.workdayId,
        workdayDate: workday.date,
        pointAdjustments: adjustmentRequest.pointAdjustments.length,
      },
    },
  })

  return {
    id: adjustmentRequest.id,
    status: params.status,
    workday: serializeAdjustmentWorkday(workday),
  }
}

async function applyPointAdjustment(
  transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  request: {
    workdayId: number
    userId: number
  },
  adjustment: {
    actionType: string
    timeEntryId: number | null
    targetKind: string
    newRecordedAt: Date | null
  }
) {
  if (adjustment.actionType === "DELETE" && adjustment.timeEntryId) {
    await transaction.timeEntry.update({
      where: { id: adjustment.timeEntryId },
      data: { status: "SUPERSEDED" },
    })
    return
  }

  if (adjustment.actionType === "UPDATE" && adjustment.timeEntryId) {
    const currentEntry = await transaction.timeEntry.findUniqueOrThrow({
      where: { id: adjustment.timeEntryId },
    })
    await transaction.timeEntry.update({
      where: { id: currentEntry.id },
      data: { status: "SUPERSEDED" },
    })
    await createAdjustedEntry(transaction, {
      workdayId: request.workdayId,
      userId: request.userId,
      kind: adjustment.targetKind,
      recordedAt: adjustment.newRecordedAt ?? currentEntry.recordedAt,
      timezone: currentEntry.timezone,
    })
    return
  }

  if (adjustment.actionType === "CREATE" && adjustment.newRecordedAt) {
    await createAdjustedEntry(transaction, {
      workdayId: request.workdayId,
      userId: request.userId,
      kind: adjustment.targetKind,
      recordedAt: adjustment.newRecordedAt,
      timezone: "America/Sao_Paulo",
    })
  }
}

async function createAdjustedEntry(
  transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  data: {
    workdayId: number
    userId: number
    kind: string
    recordedAt: Date
    timezone: string
  }
) {
  const nextSequenceResult = await transaction.timeEntry.aggregate({
    where: { workdayId: data.workdayId },
    _max: { sequence: true },
  })
  await transaction.timeEntry.create({
    data: {
      ...data,
      source: "ADJUSTMENT",
      status: "ACTIVE",
      sequence: (nextSequenceResult._max.sequence ?? 0) + 1,
    },
  })
}
