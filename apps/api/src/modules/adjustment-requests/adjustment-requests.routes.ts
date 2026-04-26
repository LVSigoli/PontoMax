import { AdjustmentActionType, AdjustmentRequestStatus, TimeEntryKind } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { endOfDay, getDateOnly, startOfDay } from '../../common/utils/date.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { ensureWorkday, recalculateWorkday } from '../time-records/time-records.service.js';

export const adjustmentRequestsRouter = Router();

const requestSchema = z.object({
  body: z.object({
    workdayDate: z.string().date(),
    justification: z.string().min(5),
    records: z
      .array(
        z.object({
          timeEntryId: z.coerce.number().int().positive().optional(),
          actionType: z.nativeEnum(AdjustmentActionType),
          targetKind: z.nativeEnum(TimeEntryKind),
          originalRecordedAt: z.string().datetime().optional(),
          newRecordedAt: z.string().datetime().optional(),
          reason: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

type CreateAdjustmentRequestBody = z.infer<typeof requestSchema>['body'];

const listSchema = z.object({
  query: z.object({
    status: z.nativeEnum(AdjustmentRequestStatus).optional(),
    userId: z.coerce.number().int().positive().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
});

const reviewSchema = z.object({
  params: z.object({
    requestId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    reviewNotes: z.string().optional(),
  }),
});

adjustmentRequestsRouter.use(authenticate);

adjustmentRequestsRouter.get(
  '/',
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const where =
      request.authUser!.role === 'EMPLOYEE'
        ? {
            companyId: request.authUser!.companyId,
            userId: request.authUser!.id,
          }
        : {
            companyId: request.authUser!.companyId,
            userId: request.query.userId ? Number(request.query.userId) : undefined,
          };

    const items = await prisma.adjustmentRequest.findMany({
      where: {
        ...where,
        status: request.query.status as AdjustmentRequestStatus | undefined,
        requestedAt: {
          gte: request.query.from ? startOfDay(request.query.from as string) : undefined,
          lte: request.query.to ? endOfDay(request.query.to as string) : undefined,
        },
      },
      include: {
        requestedBy: true,
        pointAdjustments: true,
        workday: true,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    response.json({ items });
  }),
);

adjustmentRequestsRouter.post(
  '/',
  validateRequest(requestSchema),
  asyncHandler(async (request, response) => {
    const workday = await ensureWorkday({
      companyId: request.authUser!.companyId,
      userId: request.authUser!.id,
      date: getDateOnly(request.body.workdayDate),
    });

    const createdRequest = await prisma.adjustmentRequest.create({
      data: {
        companyId: request.authUser!.companyId,
        userId: request.authUser!.id,
        workdayId: workday.id,
        justification: request.body.justification,
        status: 'PENDING',
        pointAdjustments: {
          create: (request.body as CreateAdjustmentRequestBody).records.map((record) => ({
            timeEntryId: record.timeEntryId,
            actionType: record.actionType,
            targetKind: record.targetKind,
            originalRecordedAt: record.originalRecordedAt ? new Date(record.originalRecordedAt) : null,
            newRecordedAt: record.newRecordedAt ? new Date(record.newRecordedAt) : null,
            reason: record.reason,
          })),
        },
      },
      include: {
        pointAdjustments: true,
      },
    });

    await prisma.workday.update({
      where: { id: workday.id },
      data: {
        status: 'PENDING_ADJUSTMENT',
      },
    });

    response.status(201).json({ item: createdRequest });
  }),
);

adjustmentRequestsRouter.patch(
  '/:requestId/review',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(reviewSchema),
  asyncHandler(async (request, response) => {
    const requestId = Number(request.params.requestId);
    const adjustmentRequest = await prisma.adjustmentRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: {
        pointAdjustments: true,
        workday: true,
      },
    });

    if (adjustmentRequest.companyId !== request.authUser!.companyId) {
      throw new AppError('You do not have permission to review this request.', 403);
    }

    const nextStatus = request.body.status;

    await prisma.$transaction(async (transaction) => {
      await transaction.adjustmentRequest.update({
        where: { id: adjustmentRequest.id },
        data: {
          status: nextStatus,
          reviewNotes: request.body.reviewNotes,
          reviewedById: request.authUser!.id,
          reviewedAt: new Date(),
        },
      });

      if (nextStatus === 'REJECTED') {
        await transaction.workday.update({
          where: { id: adjustmentRequest.workdayId },
          data: {
            status: 'INCONSISTENT',
          },
        });
        return;
      }

      for (const pointAdjustment of adjustmentRequest.pointAdjustments) {
        if (pointAdjustment.actionType === 'DELETE' && pointAdjustment.timeEntryId) {
          await transaction.timeEntry.update({
            where: { id: pointAdjustment.timeEntryId },
            data: {
              status: 'SUPERSEDED',
            },
          });
          continue;
        }

        if (pointAdjustment.actionType === 'UPDATE' && pointAdjustment.timeEntryId) {
          const currentEntry = await transaction.timeEntry.findUniqueOrThrow({
            where: { id: pointAdjustment.timeEntryId },
          });

          await transaction.timeEntry.update({
            where: { id: currentEntry.id },
            data: {
              status: 'SUPERSEDED',
            },
          });

          const activeEntriesCount = await transaction.timeEntry.count({
            where: {
              workdayId: adjustmentRequest.workdayId,
              status: 'ACTIVE',
            },
          });

          await transaction.timeEntry.create({
            data: {
              workdayId: adjustmentRequest.workdayId,
              userId: adjustmentRequest.userId,
              kind: pointAdjustment.targetKind,
              recordedAt: pointAdjustment.newRecordedAt ?? currentEntry.recordedAt,
              source: 'ADJUSTMENT',
              status: 'ACTIVE',
              sequence: activeEntriesCount + 1,
              timezone: currentEntry.timezone,
            },
          });
          continue;
        }

        if (pointAdjustment.actionType === 'CREATE' && pointAdjustment.newRecordedAt) {
          const activeEntriesCount = await transaction.timeEntry.count({
            where: {
              workdayId: adjustmentRequest.workdayId,
              status: 'ACTIVE',
            },
          });

          await transaction.timeEntry.create({
            data: {
              workdayId: adjustmentRequest.workdayId,
              userId: adjustmentRequest.userId,
              kind: pointAdjustment.targetKind,
              recordedAt: pointAdjustment.newRecordedAt,
              source: 'ADJUSTMENT',
              status: 'ACTIVE',
              sequence: activeEntriesCount + 1,
              timezone: 'America/Sao_Paulo',
            },
          });
        }
      }
    });

    const workday = await recalculateWorkday(adjustmentRequest.workdayId);

    response.json({
      item: {
        id: adjustmentRequest.id,
        status: nextStatus,
        workday,
      },
    });
  }),
);
