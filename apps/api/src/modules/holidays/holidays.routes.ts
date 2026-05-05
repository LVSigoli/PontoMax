import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { HOLIDAY_TYPES } from '../../common/constants/domain-enums.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { getDateOnly } from '../../common/utils/date.js';
import { getOptionalRequestCompanyId } from '../../common/utils/company-scope.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { recalculateWorkday } from '../time-records/time-records.service.js';

export const holidaysRouter = Router();

const holidayInclude = {
  companyAssignments: {
    include: {
      company: {
        select: {
          id: true,
          name: true,
          tradeName: true,
        },
      },
    },
    orderBy: {
      company: {
        name: 'asc',
      },
    },
  },
} satisfies Prisma.HolidayInclude;

type HolidayWithCompanies = Prisma.HolidayGetPayload<{
  include: typeof holidayInclude;
}>;

const listSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    year: z.coerce.number().int().optional(),
  }),
});

const holidayBodySchema = z.object({
  companyIds: z.array(z.coerce.number().int().positive()).optional(),
  name: z.string().min(2),
  date: z.string().date(),
  type: z.enum(HOLIDAY_TYPES),
  isActive: z.boolean().optional(),
});

const holidaySchema = z.object({
  body: holidayBodySchema,
});

const updateHolidaySchema = z.object({
  body: holidayBodySchema.partial(),
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
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );
    const year = request.query.year ? Number(request.query.year) : undefined;

    const where: Prisma.HolidayWhereInput = {
      date:
        year === undefined
          ? undefined
          : {
              gte: new Date(`${year}-01-01T00:00:00.000Z`),
              lte: new Date(`${year}-12-31T00:00:00.000Z`),
            },
      ...(companyId
        ? {
            OR: [
              {
                type: 'NATIONAL',
              },
              {
                companyAssignments: {
                  some: {
                    companyId,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const holidays = await prisma.holiday.findMany({
      where,
      include: holidayInclude,
      orderBy: [{ date: 'asc' }, { name: 'asc' }],
    });

    response.json({ items: holidays.map(serializeHoliday) });
  }),
);

holidaysRouter.post(
  '/',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'COMPANY_ADMIN', 'MANAGER'),
  validateRequest(holidaySchema),
  asyncHandler(async (request, response) => {
    const companyIds = await resolveHolidayCompanyIds(
      request.authUser!.role,
      request.authUser!.companyId,
      request.body.type,
      request.body.companyIds,
    );
    const holidayDate = getDateOnly(request.body.date);

    const holiday = await prisma.holiday.create({
      data: {
        name: request.body.name,
        date: holidayDate,
        type: request.body.type,
        isActive: request.body.isActive ?? true,
        companyAssignments: companyIds.length
          ? {
              create: companyIds.map((companyId) => ({
                companyId,
              })),
            }
          : undefined,
      },
      include: holidayInclude,
    });

    await refreshHolidayWorkdays([
      {
        date: holidayDate,
        type: request.body.type,
        companyIds,
      },
    ]);

    response.status(201).json({ item: serializeHoliday(holiday) });
  }),
);

holidaysRouter.patch(
  '/:holidayId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'COMPANY_ADMIN', 'MANAGER'),
  validateRequest(holidayIdSchema.merge(updateHolidaySchema)),
  asyncHandler(async (request, response) => {
    const holidayId = Number(request.params.holidayId);
    const currentHoliday = await prisma.holiday.findUniqueOrThrow({
      where: { id: holidayId },
      include: holidayInclude,
    });

    assertHolidayManagementPermission(
      request.authUser!.role,
      request.authUser!.companyId,
      currentHoliday,
    );

    const currentCompanyIds = currentHoliday.companyAssignments.map(
      (assignment) => assignment.companyId,
    );
    const nextType = request.body.type ?? currentHoliday.type;
    const nextCompanyIds =
      request.body.companyIds ??
      (nextType === 'NATIONAL' ? [] : currentCompanyIds);
    const resolvedCompanyIds = await resolveHolidayCompanyIds(
      request.authUser!.role,
      request.authUser!.companyId,
      nextType,
      nextCompanyIds,
    );

    const shouldReplaceCompanyAssignments =
      request.body.type !== undefined || request.body.companyIds !== undefined;
    const currentScope = toHolidayScope(currentHoliday);

    const holiday = await prisma.holiday.update({
      where: { id: holidayId },
      data: {
        name: request.body.name,
        date: request.body.date ? getDateOnly(request.body.date) : undefined,
        type: request.body.type,
        isActive: request.body.isActive,
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
    });

    await refreshHolidayWorkdays([currentScope, toHolidayScope(holiday)]);

    response.json({ item: serializeHoliday(holiday) });
  }),
);

holidaysRouter.delete(
  '/:holidayId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'COMPANY_ADMIN', 'MANAGER'),
  validateRequest(holidayIdSchema),
  asyncHandler(async (request, response) => {
    const holidayId = Number(request.params.holidayId);
    const currentHoliday = await prisma.holiday.findUniqueOrThrow({
      where: { id: holidayId },
      include: holidayInclude,
    });

    assertHolidayManagementPermission(
      request.authUser!.role,
      request.authUser!.companyId,
      currentHoliday,
    );

    await prisma.holiday.delete({
      where: {
        id: holidayId,
      },
    });

    await refreshHolidayWorkdays([toHolidayScope(currentHoliday)]);

    response.status(204).send();
  }),
);

function serializeHoliday(holiday: HolidayWithCompanies) {
  const companies = holiday.companyAssignments.map(({ company }) => ({
    id: company.id,
    name: company.tradeName ?? company.name,
  }));

  return {
    id: holiday.id,
    name: holiday.name,
    date: holiday.date,
    type: holiday.type,
    isActive: holiday.isActive,
    companyIds: companies.map((company) => company.id),
    companies,
  };
}

async function refreshHolidayWorkdays(scopes: HolidayScope[]) {
  const workdayIds = new Set<number>();

  for (const scope of scopes) {
    if (scope.type !== 'NATIONAL' && scope.companyIds.length === 0) {
      continue;
    }

    const workdays = await prisma.workday.findMany({
      where: {
        date: scope.date,
        ...(scope.type === 'NATIONAL'
          ? {}
          : {
              companyId: {
                in: scope.companyIds,
              },
            }),
      },
      select: {
        id: true,
      },
    });

    for (const workday of workdays) {
      workdayIds.add(workday.id);
    }
  }

  await Promise.all([...workdayIds].map((workdayId) => recalculateWorkday(workdayId)));
}

async function resolveHolidayCompanyIds(
  role: string,
  authCompanyId: number,
  type: string,
  requestedCompanyIds?: number[],
) {
  const companyIds = normalizeCompanyIds(requestedCompanyIds);

  if (type === 'NATIONAL') {
    if (role !== 'PLATFORM_ADMIN') {
      throw new AppError(
        'Only platform administrators can manage national holidays.',
        403,
      );
    }

    if (companyIds.length > 0) {
      throw new AppError(
        'National holidays apply to all companies and must not receive companyIds.',
        400,
      );
    }

    return [];
  }

  if (companyIds.length === 0) {
    throw new AppError(
      'At least one company must be selected for this holiday.',
      400,
    );
  }

  if (role !== 'PLATFORM_ADMIN') {
    if (
      companyIds.length !== 1 ||
      companyIds[0] !== authCompanyId
    ) {
      throw new AppError(
        'You do not have permission to assign this holiday to the selected companies.',
        403,
      );
    }

    return [authCompanyId];
  }

  const totalCompanies = await prisma.company.count({
    where: {
      id: {
        in: companyIds,
      },
    },
  });

  if (totalCompanies !== companyIds.length) {
    throw new AppError('One or more selected companies were not found.', 400);
  }

  return companyIds;
}

function assertHolidayManagementPermission(
  role: string,
  authCompanyId: number,
  holiday: HolidayWithCompanies,
) {
  if (role === 'PLATFORM_ADMIN') {
    return;
  }

  if (holiday.type === 'NATIONAL') {
    throw new AppError(
      'Only platform administrators can manage national holidays.',
      403,
    );
  }

  const scopedCompanyIds = holiday.companyAssignments.map(
    (assignment) => assignment.companyId,
  );

  if (
    scopedCompanyIds.length !== 1 ||
    scopedCompanyIds[0] !== authCompanyId
  ) {
    throw new AppError(
      'You do not have permission to manage this holiday.',
      403,
    );
  }
}

function normalizeCompanyIds(companyIds?: number[]) {
  return [...new Set((companyIds ?? []).map(Number).filter(Boolean))];
}

function toHolidayScope(holiday: HolidayWithCompanies): HolidayScope {
  return {
    date: holiday.date,
    type: holiday.type,
    companyIds: holiday.companyAssignments.map((assignment) => assignment.companyId),
  };
}

interface HolidayScope {
  date: Date
  type: string
  companyIds: number[]
}
