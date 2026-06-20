import {
  buildAuditActor,
  buildAuditCompany,
  recordAuditLog,
} from "../../common/audit/index.js"
import { hashPassword } from "../../common/auth/password.service.js"
import { AppError } from "../../common/errors/app-error.js"
import { prisma } from "../../lib/prisma.js"
import { sendPasswordResetEmail } from "./auth-email.service.js"
import {
  createTokenHash,
  issuePasswordResetToken,
  makePasswordSetupUrl,
} from "./password-reset.service.js"

export const forgotPasswordResponseMessage =
  "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha."

export async function requestPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  })

  if (!user?.isActive) return

  const resetToken = await issuePasswordResetToken(user.id)
  const passwordSetupUrl = makePasswordSetupUrl(resetToken)
  const mailDelivery = await sendPasswordResetEmail({
    to: user.email,
    fullName: user.fullName,
    passwordSetupUrl,
  })

  await recordAuditLog(prisma, {
    companyId: user.companyId,
    actorUserId: null,
    entityType: "AUTH",
    entityId: user.id,
    action: "RESET_PASSWORD",
    metadata: {
      summary: "Solicitacao de redefinicao de senha enviada",
      company: buildAuditCompany(user.company),
      details: {
        requestedFor: buildAuditActor(user),
        deliveryChannel: mailDelivery.channel,
        previewPath: mailDelivery.previewPath ?? null,
      },
    },
  })
}

export async function resetPassword(token: string, password: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: createTokenHash(token),
    },
  })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new AppError("Password reset token is invalid or expired.", 400)
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: await hashPassword(password),
        mustChangePassword: false,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.authSession.updateMany({
      where: {
        userId: resetToken.userId,
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    }),
  ])

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: resetToken.userId },
    include: { company: true },
  })
  await recordAuditLog(prisma, {
    companyId: user.companyId,
    actorUserId: user.id,
    entityType: "AUTH",
    entityId: user.id,
    action: "RESET_PASSWORD",
    metadata: {
      summary: "Senha redefinida com sucesso",
      actor: buildAuditActor(user),
      company: buildAuditCompany(user.company),
      details: {
        resetTokenId: resetToken.id,
        revokedSessions: true,
      },
    },
  })
}
