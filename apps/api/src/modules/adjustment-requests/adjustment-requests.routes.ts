import { Router } from "express"
import { z } from "zod"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { recordAuditLog } from "../../common/audit/index.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import {
  ADJUSTMENT_ACTION_TYPES,
  ADJUSTMENT_REQUEST_STATUSES,
  toTimeEntryKind,
  type AdjustmentRequestStatus,
  TIME_ENTRY_KINDS,
} from "../../common/constants/domain-enums.js"
import { AppError } from "../../common/errors/app-error.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { isAlternatingTimeEntrySequence } from "../../common/utils/time-records.js"
import { endOfDay, startOfDay } from "../../common/utils/date.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"
import {
  ensureWorkday,
  recalculateWorkday,
} from "../time-records/time-records.service.js"

export const adjustmentRequestsRouter = Router()

const requestSchema = z.object({
  body: z.object({
    workdayDate: z.string().date(),
    justification: z.string().min(5),
    userId: z.coerce.number().int().positive().optional(),
    records: z
      .array(
        z.object({
          timeEntryId: z.coerce.number().int().positive().optional(),
          actionType: z.enum(ADJUSTMENT_ACTION_TYPES),
          targetKind: z.enum(TIME_ENTRY_KINDS),
          originalRecordedAt: z.string().datetime().optional(),
          newRecordedAt: z.string().datetime().optional(),
          reason: z.string().optional(),
        })
      )
      .min(1),
  }),
})

type CreateAdjustmentRequestBody = z.infer<typeof requestSchema>["body"]

const listSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    status: z.enum(ADJUSTMENT_REQUEST_STATUSES).optional(),
    userId: z.coerce.number().int().positive().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
})

const reviewSchema = z.object({
  params: z.object({
    requestId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reviewNotes: z.string().optional(),
  }),
})

adjustmentRequestsRouter.use(authenticate)

adjustmentRequestsRouter.get(
  "/",
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )
    const where =
      request.authUser!.role === "EMPLOYEE"
        ? {
            companyId: request.authUser!.companyId,
            userId: request.authUser!.id,
          }
        : {
            companyId: companyId ?? undefined,
            userId: request.query.userId
              ? Number(request.query.userId)
              : undefined,
          }

    const items = await prisma.adjustmentRequest.findMany({
      where: {
        ...where,
        status: request.query.status as AdjustmentRequestStatus | undefined,
        requestedAt: {
          gte: request.query.from
            ? startOfDay(request.query.from as string)
            : undefined,
          lte: request.query.to
            ? endOfDay(request.query.to as string)
            : undefined,
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

    response.json({
      items: items.map((item) => ({
        ...item,
        workday: item.workday
          ? {
              ...item.workday,
              date: item.workday.date.toISOString().slice(0, 10),
            }
          : item.workday,
      })),
    })
  })
)

adjustmentRequestsRouter.post(
  "/",
  validateRequest(requestSchema),
  asyncHandler(async (request, response) => {
    const targetUserId = request.body.userId ?? request.authUser!.id
    const targetUser = await prisma.user.findUniqueOrThrow({
      where: { id: targetUserId },
      select: {
        companyId: true,
        fullName: true,
        id: true,
      },
    })

    if (
      request.authUser!.role === "EMPLOYEE" &&
      targetUser.id !== request.authUser!.id
    ) {
      throw new AppError(
        "You do not have permission to request this adjustment.",
        403
      )
    }

    if (
      request.authUser!.role === "COMPANY_ADMIN" &&
      targetUser.companyId !== request.authUser!.companyId
    ) {
      throw new AppError(
        "You do not have permission to request this adjustment.",
        403
      )
    }

    const workday = await ensureWorkday({
      companyId: targetUser.companyId,
      userId: targetUser.id,
      date: request.body.workdayDate,
    })

    const createdRequest = await prisma.adjustmentRequest.create({
      data: {
        companyId: targetUser.companyId,
        userId: targetUser.id,
        workdayId: workday.id,
        justification: request.body.justification,
        status: "PENDING",
        pointAdjustments: {
          create: (request.body as CreateAdjustmentRequestBody).records.map(
            (record) => ({
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
            })
          ),
        },
      },
      include: {
        pointAdjustments: true,
      },
    })

    const updatedWorkday = await prisma.workday.update({
      where: { id: workday.id },
      data: {
        status: "PENDING_ADJUSTMENT",
      },
    })

    await recordAuditLog(prisma, {
      companyId: targetUser.companyId,
      actorUserId: request.authUser!.id,
      entityType: "ADJUSTMENT_REQUEST",
      entityId: createdRequest.id,
      action: "CREATE",
      metadata: {
        summary: "Solicitação de ajuste criada",
        details: {
          workdayId: workday.id,
          workdayDate: workday.date,
          justification: request.body.justification,
          records: request.body.records,
        },
      },
    })

    response.status(201).json({
      item: {
        ...createdRequest,
        requestedBy: {
          fullName: targetUser.fullName,
        },
        workday: {
          ...updatedWorkday,
          date: workday.date.toISOString().slice(0, 10),
        },
      },
    })
  })
)

adjustmentRequestsRouter.patch(
  "/:requestId/review",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(reviewSchema),
  asyncHandler(async (request, response) => {
    const requestId = Number(request.params.requestId)
    const adjustmentRequest = await prisma.adjustmentRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: {
        pointAdjustments: true,
        workday: true,
      },
    })

    if (
      request.authUser!.role !== "PLATFORM_ADMIN" &&
      adjustmentRequest.companyId !== request.authUser!.companyId
    ) {
      throw new AppError(
        "You do not have permission to review this request.",
        403
      )
    }

    const nextStatus = request.body.status

    await prisma.$transaction(async (transaction) => {
      await transaction.adjustmentRequest.update({
        where: { id: adjustmentRequest.id },
        data: {
          status: nextStatus,
          reviewNotes: request.body.reviewNotes,
          reviewedById: request.authUser!.id,
          reviewedAt: new Date(),
        },
      })

      if (nextStatus === "REJECTED") {
        await transaction.workday.update({
          where: { id: adjustmentRequest.workdayId },
          data: {
            status: "REJECTED",
          },
        })
        return
      }

      for (const pointAdjustment of adjustmentRequest.pointAdjustments) {
        if (
          pointAdjustment.actionType === "DELETE" &&
          pointAdjustment.timeEntryId
        ) {
          await transaction.timeEntry.update({
            where: { id: pointAdjustment.timeEntryId },
            data: {
              status: "SUPERSEDED",
            },
          })
          continue
        }

        if (
          pointAdjustment.actionType === "UPDATE" &&
          pointAdjustment.timeEntryId
        ) {
          const currentEntry = await transaction.timeEntry.findUniqueOrThrow({
            where: { id: pointAdjustment.timeEntryId },
          })

          await transaction.timeEntry.update({
            where: { id: currentEntry.id },
            data: {
              status: "SUPERSEDED",
            },
          })

          const nextSequenceResult = await transaction.timeEntry.aggregate({
            where: {
              workdayId: adjustmentRequest.workdayId,
            },
            _max: {
              sequence: true,
            },
          })

          await transaction.timeEntry.create({
            data: {
              workdayId: adjustmentRequest.workdayId,
              userId: adjustmentRequest.userId,
              kind: pointAdjustment.targetKind,
              recordedAt:
                pointAdjustment.newRecordedAt ?? currentEntry.recordedAt,
              source: "ADJUSTMENT",
              status: "ACTIVE",
              sequence: (nextSequenceResult._max.sequence ?? 0) + 1,
              timezone: currentEntry.timezone,
            },
          })
          continue
        }

        if (
          pointAdjustment.actionType === "CREATE" &&
          pointAdjustment.newRecordedAt
        ) {
          const nextSequenceResult = await transaction.timeEntry.aggregate({
            where: {
              workdayId: adjustmentRequest.workdayId,
            },
            _max: {
              sequence: true,
            },
          })

          await transaction.timeEntry.create({
            data: {
              workdayId: adjustmentRequest.workdayId,
              userId: adjustmentRequest.userId,
              kind: pointAdjustment.targetKind,
              recordedAt: pointAdjustment.newRecordedAt,
              source: "ADJUSTMENT",
              status: "ACTIVE",
              sequence: (nextSequenceResult._max.sequence ?? 0) + 1,
              timezone: "America/Sao_Paulo",
            },
          })
        }
      }

      const activeTimeEntries = await transaction.timeEntry.findMany({
        where: {
          workdayId: adjustmentRequest.workdayId,
          status: "ACTIVE",
        },
        orderBy: [
          {
            recordedAt: "asc",
          },
          {
            sequence: "asc",
          },
        ],
      })

      const normalizedActiveTimeEntries = activeTimeEntries.map((entry) => ({
        kind: toTimeEntryKind(entry.kind),
        recordedAt: entry.recordedAt,
        sequence: entry.sequence,
      }))

      if (!isAlternatingTimeEntrySequence(normalizedActiveTimeEntries)) {
        throw new AppError(
          "The approved adjustment would create an invalid time entry sequence.",
          400
        )
      }
    })

    if (nextStatus === "APPROVED") {
      await recalculateWorkday(adjustmentRequest.workdayId)
    }

    const workday = await prisma.workday.update({
      where: { id: adjustmentRequest.workdayId },
      data: {
        status: nextStatus === "APPROVED" ? "ADJUSTED" : "REJECTED",
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })

    await recordAuditLog(prisma, {
      companyId: adjustmentRequest.companyId,
      actorUserId: request.authUser!.id,
      entityType: "ADJUSTMENT_REQUEST",
      entityId: adjustmentRequest.id,
      action: nextStatus === "APPROVED" ? "APPROVE" : "REJECT",
      metadata: {
        summary:
          nextStatus === "APPROVED"
            ? "Solicitação de ajuste aprovada"
            : "Solicitação de ajuste recusada",
        details: {
          status: nextStatus,
          reviewNotes: request.body.reviewNotes ?? null,
          workdayId: adjustmentRequest.workdayId,
          workdayDate: workday.date,
          pointAdjustments: adjustmentRequest.pointAdjustments.length,
        },
      },
    })

    response.json({
      item: {
        id: adjustmentRequest.id,
        status: nextStatus,
        workday: {
          ...workday,
          date: workday.date.toISOString().slice(0, 10),
        },
      },
    })
  })
)
