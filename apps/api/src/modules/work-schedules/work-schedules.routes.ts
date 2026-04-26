import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { parseTimeStringToDate } from '../../common/utils/date.js';
import { getRequestCompanyId } from '../../common/utils/company-scope.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';

export const workSchedulesRouter = Router();

const listSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
});

const journeySchema = z.object({
  body: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    name: z.string().min(2),
    description: z.string().optional(),
    scaleCode: z.string().min(2),
    flexibleSchedule: z.boolean().optional(),
    dailyWorkMinutes: z.coerce.number().int().nonnegative(),
    weeklyWorkMinutes: z.coerce.number().int().nonnegative().optional(),
    expectedEntryTime: z.string().optional(),
    expectedExitTime: z.string().optional(),
    breakMinutes: z.coerce.number().int().nonnegative().optional(),
    toleranceMinutes: z.coerce.number().int().nonnegative().optional(),
    nightShift: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateJourneySchema = z.object({
  body: journeySchema.shape.body.partial(),
});

const journeyIdSchema = z.object({
  params: z.object({
    journeyId: z.coerce.number().int().positive(),
  }),
});

workSchedulesRouter.use(authenticate);

workSchedulesRouter.get(
  '/',
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );

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
        name: 'asc',
      },
    });

    response.json({
      items: journeys.map((journey) => ({
        ...journey,
        employees: journey._count.userAssignments,
      })),
    });
  }),
);

workSchedulesRouter.post(
  '/',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(journeySchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(request, request.body.companyId);

    const journey = await prisma.journey.create({
      data: {
        companyId,
        name: request.body.name,
        description: request.body.description,
        scaleCode: request.body.scaleCode,
        flexibleSchedule: request.body.flexibleSchedule ?? false,
        dailyWorkMinutes: request.body.dailyWorkMinutes,
        weeklyWorkMinutes: request.body.weeklyWorkMinutes,
        expectedEntryTime: parseTimeStringToDate(request.body.expectedEntryTime),
        expectedExitTime: parseTimeStringToDate(request.body.expectedExitTime),
        breakMinutes: request.body.breakMinutes ?? 60,
        toleranceMinutes: request.body.toleranceMinutes ?? 10,
        nightShift: request.body.nightShift ?? false,
        isActive: request.body.isActive ?? true,
      },
    });

    response.status(201).json({ item: journey });
  }),
);

workSchedulesRouter.patch(
  '/:journeyId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(journeyIdSchema.merge(updateJourneySchema)),
  asyncHandler(async (request, response) => {
    const journeyId = Number(request.params.journeyId);
    const currentJourney = await prisma.journey.findUniqueOrThrow({
      where: { id: journeyId },
    });

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      currentJourney.companyId !== request.authUser!.companyId
    ) {
      throw new AppError('You do not have permission to update this journey.', 403);
    }

    const journey = await prisma.journey.update({
      where: { id: journeyId },
      data: {
        ...request.body,
        expectedEntryTime:
          request.body.expectedEntryTime === undefined
            ? undefined
            : parseTimeStringToDate(request.body.expectedEntryTime),
        expectedExitTime:
          request.body.expectedExitTime === undefined
            ? undefined
            : parseTimeStringToDate(request.body.expectedExitTime),
      },
    });

    response.json({ item: journey });
  }),
);
