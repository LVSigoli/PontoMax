import {
  buildAuditActor,
  buildAuditCompany,
  recordAuditLog,
} from "../../common/audit/index.js"
import { makeSessionResponse } from "../../common/auth/auth-response.js"
import { verifyPassword } from "../../common/auth/password.service.js"
import {
  generateOpaqueToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../common/auth/token.service.js"
import { toUserRole } from "../../common/constants/domain-enums.js"
import { AppError } from "../../common/errors/app-error.js"
import { durationToMilliseconds } from "../../common/utils/duration.js"
import { prisma } from "../../lib/prisma.js"
import { issuePasswordResetToken } from "./password-reset.service.js"

export async function login(params: {
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}) {
  const email = params.email.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  })

  if (
    !user ||
    !user.isActive ||
    !(await verifyPassword(params.password, user.passwordHash))
  ) {
    throw new AppError("Invalid email or password.", 401)
  }

  if (user.mustChangePassword) {
    const resetToken = await issuePasswordResetToken(user.id)
    await recordAuditLog(prisma, {
      companyId: user.companyId,
      actorUserId: user.id,
      entityType: "AUTH",
      entityId: user.id,
      action: "LOGIN",
      metadata: {
        summary: "Login autenticado com troca de senha obrigatória",
        actor: buildAuditActor(user),
        company: buildAuditCompany(user.company),
        details: {
          requiresPasswordChange: true,
          resetTokenIssued: true,
        },
      },
    })

    return {
      requiresPasswordChange: true as const,
      message: "Password change is required before accessing the platform.",
      email: user.email,
      resetToken,
    }
  }

  const refreshToken = generateOpaqueToken()
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshToken,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      expiresAt: new Date(
        Date.now() +
          durationToMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d")
      ),
    },
  })
  const tokens = createSessionTokens(user, session.id, refreshToken)

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })
  await recordAuditLog(prisma, {
    companyId: user.companyId,
    actorUserId: user.id,
    entityType: "AUTH",
    entityId: session.id,
    action: "LOGIN",
    metadata: {
      summary: "Login realizado com sucesso",
      actor: buildAuditActor(user),
      company: buildAuditCompany(user.company),
      details: {
        sessionId: session.id,
        requiresPasswordChange: false,
      },
    },
  })

  return makeSessionResponse({
    ...tokens,
    user,
  })
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)
  const session = await prisma.authSession.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: { company: true },
      },
    },
  })

  if (
    !session ||
    session.status !== "ACTIVE" ||
    session.revokedAt ||
    session.expiresAt < new Date() ||
    session.refreshToken !== payload.sessionToken
  ) {
    throw new AppError("Refresh token is invalid or expired.", 401)
  }

  return makeSessionResponse({
    ...createSessionTokens(session.user, session.id, session.refreshToken),
    user: session.user,
  })
}

export async function logout(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.id },
    include: { company: true },
  })

  await prisma.authSession.updateMany({
    where: {
      id: payload.sessionId,
      refreshToken: payload.sessionToken,
      status: "ACTIVE",
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  })
  await recordAuditLog(prisma, {
    companyId: user.companyId,
    actorUserId: user.id,
    entityType: "AUTH",
    entityId: payload.sessionId,
    action: "LOGOUT",
    metadata: {
      summary: "Sessão encerrada",
      actor: buildAuditActor(user),
      company: buildAuditCompany(user.company),
      details: { sessionId: payload.sessionId },
    },
  })
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { company: true },
  })

  return makeSessionResponse({
    accessToken: "",
    refreshToken: "",
    user,
  }).user
}

function createSessionTokens(
  user: {
    id: number
    companyId: number
    role: string
    email: string
  },
  sessionId: number,
  sessionToken: string
) {
  const tokenUser = {
    id: user.id,
    companyId: user.companyId,
    role: toUserRole(user.role),
    email: user.email,
  }

  return {
    accessToken: signAccessToken(tokenUser),
    refreshToken: signRefreshToken({
      ...tokenUser,
      sessionId,
      sessionToken,
    }),
  }
}
