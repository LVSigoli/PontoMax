import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { hashPassword } from '../../common/auth/password.service.js';
import { USER_ROLES } from '../../common/constants/domain-enums.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { getOptionalRequestCompanyId, getRequestCompanyId } from '../../common/utils/company-scope.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { getDateOnly } from '../../common/utils/date.js';
import { issuePasswordResetToken, makePasswordSetupUrl } from '../auth/password-reset.service.js';

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
    role: z.enum(USER_ROLES),
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
  requireRole('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
  validateRequest(listUsersSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );

    const users = await prisma.user.findMany({
      where: {
        companyId: companyId ?? undefined,
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
  requireRole('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
  validateRequest(userSchema),
  asyncHandler(async (request, response) => {
    const companyId = getRequestCompanyId(request, request.body.companyId);
    const requestedRole = request.body.role;

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      requestedRole === 'PLATFORM_ADMIN'
    ) {
      throw new AppError(
        'You do not have permission to assign this role.',
        403,
      );
    }

    const journey = request.body.journeyId
      ? await prisma.journey.findUniqueOrThrow({
          where: { id: request.body.journeyId },
        })
      : null;

    if (journey && journey.companyId !== companyId) {
      throw new AppError(
        'You do not have permission to assign this journey.',
        403,
      );
    }

    const temporaryPassword = request.body.password ?? generateTemporaryPassword();

    const user = await prisma.user.create({
      data: {
        companyId,
        employeeCode: request.body.employeeCode,
        fullName: request.body.fullName,
        email: request.body.email.trim().toLowerCase(),
        cpf: request.body.cpf,
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
        role: request.body.role,
        position: request.body.position,
        isActive: request.body.isActive ?? true,
      },
    });

    if (request.body.journeyId) {
      await prisma.userJourneyAssignment.upsert({
        create: {
          userId: user.id,
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
        },
        update: {
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validTo: null,
        },
        where: {
          userId_validFrom: {
            userId: user.id,
            validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
          },
        },
      });
    }

    const createdUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
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
    });

    const resetToken = await issuePasswordResetToken(user.id);
    const passwordSetupUrl = makePasswordSetupUrl(resetToken);
    const inviteMessage = [
      'Convite de acesso ao PontoMax',
      '',
      `E-mail cadastrado: ${createdUser.email}`,
      `Senha temporaria: ${temporaryPassword}`,
      `URL de convite: ${passwordSetupUrl}`,
      '',
      'No primeiro acesso, a troca de senha sera obrigatoria.',
    ].join('\n');

    response.status(201).json({
      item: {
        id: createdUser.id,
        companyId: createdUser.companyId,
        companyName: createdUser.company.name,
        employeeCode: createdUser.employeeCode,
        fullName: createdUser.fullName,
        email: createdUser.email,
        cpf: createdUser.cpf,
        role: createdUser.role,
        position: createdUser.position,
        isActive: createdUser.isActive,
        journeyId: createdUser.journeyAssignments[0]?.journeyId ?? null,
        journeyName: createdUser.journeyAssignments[0]?.journey.name ?? null,
      },
      invite: {
        email: createdUser.email,
        temporaryPassword,
        invitationUrl: passwordSetupUrl,
        requiresPasswordChange: true,
        copyText: inviteMessage,
      },
    });
  }),
);

usersRouter.patch(
  '/:userId',
  requireRole('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
  validateRequest(userIdSchema.merge(updateUserSchema)),
  asyncHandler(async (request, response) => {
    const userId = Number(request.params.userId);
    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (request.authUser!.role !== 'PLATFORM_ADMIN' && currentUser.companyId !== request.authUser!.companyId) {
      throw new AppError('You do not have permission to update this user.', 403);
    }

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      request.body.role === 'PLATFORM_ADMIN'
    ) {
      throw new AppError(
        'You do not have permission to assign this role.',
        403,
      );
    }

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      request.body.companyId !== undefined &&
      request.body.companyId !== currentUser.companyId
    ) {
      throw new AppError(
        'You do not have permission to move this user to another company.',
        403,
      );
    }

    const resolvedCompanyId =
      request.authUser!.role === 'PLATFORM_ADMIN'
        ? request.body.companyId ?? currentUser.companyId
        : currentUser.companyId;
    const journey = request.body.journeyId
      ? await prisma.journey.findUniqueOrThrow({
          where: { id: request.body.journeyId },
        })
      : null;

    if (journey && journey.companyId !== resolvedCompanyId) {
      throw new AppError(
        'You do not have permission to assign this journey.',
        403,
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        companyId:
          request.authUser!.role === 'PLATFORM_ADMIN'
            ? request.body.companyId
            : undefined,
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
      await prisma.userJourneyAssignment.upsert({
        create: {
          userId: user.id,
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
        },
        update: {
          journeyId: request.body.journeyId,
          createdById: request.authUser!.id,
          validTo: null,
        },
        where: {
          userId_validFrom: {
            userId: user.id,
            validFrom: getDateOnly(request.body.journeyValidFrom ?? new Date()),
          },
        },
      });
    }

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
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
    });

    response.json({
      item: {
        id: updatedUser.id,
        companyId: updatedUser.companyId,
        companyName: updatedUser.company.name,
        employeeCode: updatedUser.employeeCode,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        cpf: updatedUser.cpf,
        role: updatedUser.role,
        position: updatedUser.position,
        isActive: updatedUser.isActive,
        journeyId: updatedUser.journeyAssignments[0]?.journeyId ?? null,
        journeyName: updatedUser.journeyAssignments[0]?.journey.name ?? null,
      },
    });
  }),
);

function generateTemporaryPassword(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

usersRouter.get(
  '/:userId',
  requireRole('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
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

    if (
      request.authUser!.role !== 'PLATFORM_ADMIN' &&
      user.companyId !== request.authUser!.companyId
    ) {
      throw new AppError('You do not have permission to access this user.', 403);
    }

    response.json({ item: user });
  }),
);

usersRouter.delete(
  '/:userId',
  requireRole('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
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
