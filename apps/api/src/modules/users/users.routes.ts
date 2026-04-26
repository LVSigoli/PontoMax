import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { hashPassword } from '../../common/auth/password.service.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { getRequestCompanyId } from '../../common/utils/company-scope.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { getDateOnly } from '../../common/utils/date.js';

export const usersRouter = Router();

const listUsersSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
});

const userSchema = z.object({
  body: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    employeeCode: z.string().optional(),
    fullName: z.string().min(2),
    email: z.string().email(),
    cpf: z.string().min(11),
    password: z.string().min(6).optional(),
    role: z.nativeEnum(UserRole),
    position: z.string().optional(),
    isActive: z.boolean().optional(),
    journeyId: z.coerce.number().int().positive().optional(),
    journeyValidFrom: z.string().date().optional(),
  }),
});

const updateUserSchema = z.object({
  body: userSchema.shape.body.partial(),
});

const userIdSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
});

usersRouter.use(authenticate);

usersRouter.get(
  '/',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(listUsersSchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );

    const users = await prisma.user.findMany({
      where: {
        companyId,
      },
      include: {
        company: true,
        journeyAssignments: {
          include: {
            journey: true,
          },
          orderBy: {
            validFrom: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    response.json({
      items: users.map((user) => ({
        id: user.id,
        companyId: user.companyId,
        companyName: user.company.name,
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
        position: user.position,
        isActive: user.isActive,
        journeyId: user.journeyAssignments[0]?.journeyId ?? null,
        journeyName: user.journeyAssignments[0]?.journey.name ?? null,
      })),
    });
  }),
);

usersRouter.post(
  '/',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(userSchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(request, request.body.companyId);

    const user = await prisma.user.create({
      data: {
        companyId,
        employeeCode: request.body.employeeCode,
        fullName: request.body.fullName,
        email: request.body.email.trim().toLowerCase(),
        cpf: request.body.cpf,
        passwordHash: await hashPassword(request.body.password ?? '123456'),
        role: request.body.role,
        position: request.body.position,
        isActive: request.body.isActive ?? true,
      },
    });

    if (request.body.journeyId) {
      await prisma.userJourneyAssignment.create({
        data: {
          userId: user.id,
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
        },
      });
    }

    response.status(201).json({ item: user });
  }),
);

usersRouter.patch(
  '/:userId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(userIdSchema.merge(updateUserSchema)),
  asyncHandler(async (request, response) => {
    const userId = Number(request.params.userId);
    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (request.authUser!.role !== 'PLATFORM_ADMIN' && currentUser.companyId !== request.authUser!.companyId) {
      throw new AppError('You do not have permission to update this user.', 403);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        employeeCode: request.body.employeeCode,
        fullName: request.body.fullName,
        email: request.body.email?.trim().toLowerCase(),
        cpf: request.body.cpf,
        role: request.body.role,
        position: request.body.position,
        isActive: request.body.isActive,
        passwordHash: request.body.password
          ? await hashPassword(request.body.password)
          : undefined,
      },
    });

    if (request.body.journeyId) {
      await prisma.userJourneyAssignment.create({
        data: {
          userId: user.id,
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
        },
      });
    }

    response.json({ item: user });
  }),
);

usersRouter.get(
  '/:userId',
  validateRequest(userIdSchema),
  asyncHandler(async (request, response) => {
    const userId = Number(request.params.userId);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        company: true,
        journeyAssignments: {
          include: {
            journey: true,
          },
          orderBy: {
            validFrom: 'desc',
          },
        },
      },
    });

    if (request.authUser!.role !== 'PLATFORM_ADMIN' && user.companyId !== request.authUser!.companyId) {
      throw new AppError('You do not have permission to access this user.', 403);
    }

    response.json({ item: user });
  }),
);

usersRouter.delete(
  '/:userId',
  requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'MANAGER'),
  validateRequest(userIdSchema),
  asyncHandler(async (request, response) => {
    const userId = Number(request.params.userId);
    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (request.authUser!.role !== 'PLATFORM_ADMIN' && currentUser.companyId !== request.authUser!.companyId) {
      throw new AppError('You do not have permission to remove this user.', 403);
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    response.status(204).send();
  }),
);
