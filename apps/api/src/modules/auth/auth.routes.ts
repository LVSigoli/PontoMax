import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../common/errors/app-error.js';
import {
  buildAuditActor,
  buildAuditCompany,
  recordAuditLog,
} from '../../common/audit/index.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { makeSessionResponse } from '../../common/auth/auth-response.js';
import { hashPassword, verifyPassword } from '../../common/auth/password.service.js';
import {
  generateOpaqueToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../common/auth/token.service.js';
import { authenticate } from '../../common/auth/auth.middleware.js';
import { toUserRole } from '../../common/constants/domain-enums.js';
import { durationToMilliseconds } from '../../common/utils/duration.js';
import { sendPasswordResetEmail } from './auth-email.service.js';
import {
  createTokenHash,
  issuePasswordResetToken,
  makePasswordSetupUrl,
} from './password-reset.service.js';

export const authRouter = Router();

const forgotPasswordResponseMessage =
  'Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha.';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

authRouter.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(async (request, response) => {
    const email = request.body.email.trim().toLowerCase();
    const password = request.body.password;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.mustChangePassword) {
      const resetToken = await issuePasswordResetToken(user.id);

      await recordAuditLog(prisma, {
        companyId: user.companyId,
        actorUserId: user.id,
        entityType: 'AUTH',
        entityId: user.id,
        action: 'LOGIN',
        metadata: {
          summary: 'Login autenticado com troca de senha obrigatória',
          actor: buildAuditActor(user),
          company: buildAuditCompany(user.company),
          details: {
            requiresPasswordChange: true,
            resetTokenIssued: true,
          },
        },
      });

      response.json({
        requiresPasswordChange: true,
        message: 'Password change is required before accessing the platform.',
        email: user.email,
        resetToken,
      });
      return;
    }

    const refreshToken = generateOpaqueToken();
    const refreshTokenExpiresAt = new Date(
      Date.now() + durationToMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
    );

    const session = await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        expiresAt: refreshTokenExpiresAt,
      },
    });

    const accessToken = signAccessToken({
      id: user.id,
      companyId: user.companyId,
      role: toUserRole(user.role),
      email: user.email,
    });

    const signedRefreshToken = signRefreshToken({
      id: user.id,
      companyId: user.companyId,
      role: toUserRole(user.role),
      email: user.email,
      sessionId: session.id,
      sessionToken: refreshToken,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    await recordAuditLog(prisma, {
      companyId: user.companyId,
      actorUserId: user.id,
      entityType: 'AUTH',
      entityId: session.id,
      action: 'LOGIN',
      metadata: {
        summary: 'Login realizado com sucesso',
        actor: buildAuditActor(user),
        company: buildAuditCompany(user.company),
        details: {
          sessionId: session.id,
          requiresPasswordChange: false,
        },
      },
    });

    response.json(
      makeSessionResponse({
        accessToken,
        refreshToken: signedRefreshToken,
        user,
      }),
    );
  }),
);

authRouter.post(
  '/refresh',
  validateRequest(refreshSchema),
  asyncHandler(async (request, response) => {
    const payload = verifyRefreshToken(request.body.refreshToken);

    const session = await prisma.authSession.findUnique({
      where: {
        id: payload.sessionId,
      },
      include: {
        user: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!session || session.status !== 'ACTIVE' || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError('Refresh token is invalid or expired.', 401);
    }

    if (session.refreshToken !== payload.sessionToken) {
      throw new AppError('Refresh token is invalid or expired.', 401);
    }

    const accessToken = signAccessToken({
      id: session.user.id,
      companyId: session.user.companyId,
      role: toUserRole(session.user.role),
      email: session.user.email,
    });

    const nextRefreshToken = signRefreshToken({
      id: session.user.id,
      companyId: session.user.companyId,
      role: toUserRole(session.user.role),
      email: session.user.email,
      sessionId: session.id,
      sessionToken: session.refreshToken,
    });

    response.json(
      makeSessionResponse({
        accessToken,
        refreshToken: nextRefreshToken,
        user: session.user,
      }),
    );
  }),
);

authRouter.post(
  '/logout',
  validateRequest(logoutSchema),
  asyncHandler(async (request, response) => {
    const payload = verifyRefreshToken(request.body.refreshToken);
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: payload.id,
      },
      include: {
        company: true,
      },
    });

    await prisma.authSession.updateMany({
      where: {
        id: payload.sessionId,
        refreshToken: payload.sessionToken,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await recordAuditLog(prisma, {
      companyId: user.companyId,
      actorUserId: user.id,
      entityType: 'AUTH',
      entityId: payload.sessionId,
      action: 'LOGOUT',
      metadata: {
        summary: 'Sessão encerrada',
        actor: buildAuditActor(user),
        company: buildAuditCompany(user.company),
        details: {
          sessionId: payload.sessionId,
        },
      },
    });

    response.status(204).send();
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: request.authUser!.id,
      },
      include: {
        company: true,
      },
    });

    response.json({
      user: makeSessionResponse({
        accessToken: '',
        refreshToken: '',
        user,
      }).user,
    });
  }),
);

authRouter.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (request, response) => {
    const email = request.body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (user?.isActive) {
      const resetToken = await issuePasswordResetToken(user.id);
      const passwordSetupUrl = makePasswordSetupUrl(resetToken);
      const mailDelivery = await sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        passwordSetupUrl,
      });

      await recordAuditLog(prisma, {
        companyId: user.companyId,
        actorUserId: null,
        entityType: 'AUTH',
        entityId: user.id,
        action: 'RESET_PASSWORD',
        metadata: {
          summary: 'Solicitacao de redefinicao de senha enviada',
          company: buildAuditCompany(user.company),
          details: {
            requestedFor: buildAuditActor(user),
            deliveryChannel: mailDelivery.channel,
            previewPath: mailDelivery.previewPath ?? null,
          },
        },
      });
    }

    response.json({
      message: forgotPasswordResponseMessage,
    });
  }),
);

authRouter.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(async (request, response) => {
    const tokenHash = createTokenHash(request.body.token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new AppError('Password reset token is invalid or expired.', 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash: await hashPassword(request.body.password),
          mustChangePassword: false,
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.authSession.updateMany({
        where: {
          userId: resetToken.userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
        },
      }),
    ]);

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: resetToken.userId,
      },
      include: {
        company: true,
      },
    });

    await recordAuditLog(prisma, {
      companyId: user.companyId,
      actorUserId: user.id,
      entityType: 'AUTH',
      entityId: user.id,
      action: 'RESET_PASSWORD',
      metadata: {
        summary: 'Senha redefinida com sucesso',
        actor: buildAuditActor(user),
        company: buildAuditCompany(user.company),
        details: {
          resetTokenId: resetToken.id,
          revokedSessions: true,
        },
      },
    });

    response.status(204).send();
  }),
);
