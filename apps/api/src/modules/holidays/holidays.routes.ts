import { HolidayType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { getDateOnly } from '../../common/utils/date.js';
import { getRequestCompanyId } from '../../common/utils/company-scope.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';

export const holidaysRouter = Router();

const listSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    year: z.coerce.number().int().optional(),
  }),
});

const holidaySchema = z.object({
  body: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    name: z.string().min(2),
    date: z.string().date(),
    type: z.nativeEnum(HolidayType),
    isActive: z.boolean().optional(),
  }),
});

const updateHolidaySchema = z.object({
  body: holidaySchema.shape.body.partial(),
});

const holidayIdSchema = z.object({
  params: z.object({
    holidayId: z.coerce.number().int().positive(),
  }),
});

holidaysRouter.use(authenticate);

holidaysRouter.get(
  '/',
  validateRequest(listSchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );
    const year = request.query.year ? Number(request.query.year) : undefined;

    const holidays = await prisma.holiday.findMany({
      where: {
        companyId,
        date:
          year === undefined
            ? undefined
            : {
                gte: new Date(`${year}-01-01T00:00:00.000Z`),
                lte: new Date(`${year}-12-31T00:00:00.000Z`),
              },
      },
      orderBy: {
        date: 'asc',
      },
    });

    response.json({ items: holidays });
  }),
);

holidaysRouter.post(
  '/',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(holidaySchema),
  asyncHandler(async (request, response) => {
    const holiday = await prisma.holiday.create({
      data: {
        companyId: getRequestCompanyId(request, request.body.companyId),
        name: request.body.name,
        date: getDateOnly(request.body.date),
        type: request.body.type,
        isActive: request.body.isActive ?? true,
      },
    });

    response.status(201).json({ item: holiday });
  }),
);

holidaysRouter.patch(
  '/:holidayId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(holidayIdSchema.merge(updateHolidaySchema)),
  asyncHandler(async (request, response) => {
    const holidayId = Number(request.params.holidayId);
    const currentHoliday = await prisma.holiday.findUniqueOrThrow({
      where: { id: holidayId },
    });

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      currentHoliday.companyId !== request.authUser!.companyId
    ) {
      throw new AppError('You do not have permission to update this holiday.', 403);
    }

    const holiday = await prisma.holiday.update({
      where: { id: holidayId },
      data: {
        name: request.body.name,
        date: request.body.date ? getDateOnly(request.body.date) : undefined,
        type: request.body.type,
        isActive: request.body.isActive,
      },
    });

    response.json({ item: holiday });
  }),
);

holidaysRouter.delete(
  '/:holidayId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(holidayIdSchema),
  asyncHandler(async (request, response) => {
    const holidayId = Number(request.params.holidayId);
    const currentHoliday = await prisma.holiday.findUniqueOrThrow({
      where: { id: holidayId },
    });

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      currentHoliday.companyId !== request.authUser!.companyId
    ) {
      throw new AppError('You do not have permission to remove this holiday.', 403);
    }

    await prisma.holiday.delete({
      where: {
        id: holidayId,
      },
    });

    response.status(204).send();
  }),
);
