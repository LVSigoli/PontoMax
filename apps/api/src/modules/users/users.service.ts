import type { AuthUser } from "../../common/auth/auth.types.js"

import {
  buildAuditCompany,
  buildChangeSet,
  recordAuditLog,
} from "../../common/audit/index.js"
import { hashPassword } from "../../common/auth/password.service.js"
import { AppError } from "../../common/errors/app-error.js"
import { getDateOnly } from "../../common/utils/date.js"
import { prisma } from "../../lib/prisma.js"
import { sendInviteEmail } from "../auth/auth-email.service.js"
import {
  issuePasswordResetToken,
  makePasswordSetupUrl,
} from "../auth/password-reset.service.js"
import type { CreateUserInput, UpdateUserInput } from "./users.schemas.js"
import {
  findUserWithCurrentJourney,
  listUsersWithCurrentJourney,
} from "./users.repository.js"
import { buildUserAuditSnapshot, serializeUser } from "./users.serializer.js"

export async function listUsers(companyId?: number) {
  return (await listUsersWithCurrentJourney(companyId)).map(serializeUser)
}

export async function getUser(userId: number, authUser: AuthUser) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      company: true,
      journeyAssignments: {
        include: {
          journey: true,
        },
        orderBy: {
          validFrom: "desc",
        },
      },
    },
  })

  assertUserCompanyAccess(authUser, user.companyId, "access")
  return user
}

export async function createUser(params: {
  data: CreateUserInput
  companyId: number
  actor: AuthUser
}) {
  assertAssignableRole(params.actor, params.data.role)
  await assertJourneyCompany(params.data.journeyId, params.companyId)

  const temporaryPassword = params.data.password ?? generateTemporaryPassword()
  const user = await prisma.user.create({
    data: {
      companyId: params.companyId,
      employeeCode: params.data.employeeCode,
      fullName: params.data.fullName,
      email: params.data.email.trim().toLowerCase(),
      cpf: params.data.cpf,
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      role: params.data.role,
      position: params.data.position,
      isActive: params.data.isActive ?? true,
    },
  })

  await assignJourney({
    userId: user.id,
    journeyId: params.data.journeyId,
    validFrom: params.data.journeyValidFrom,
    actorUserId: params.actor.id,
  })

  const createdUser = await findUserWithCurrentJourney(user.id)
  const resetToken = await issuePasswordResetToken(user.id)
  const passwordSetupUrl = makePasswordSetupUrl(resetToken)
  const mailDelivery = await sendInviteEmail({
    to: createdUser.email,
    fullName: createdUser.fullName,
    passwordSetupUrl,
  })

  await recordAuditLog(prisma, {
    companyId: createdUser.companyId,
    actorUserId: params.actor.id,
    entityType: "USER",
    entityId: createdUser.id,
    action: "CREATE",
    metadata: {
      summary: "Usuário criado",
      company: buildAuditCompany(createdUser.company),
      details: {
        after: buildUserAuditSnapshot(createdUser),
        invite: {
          requiresPasswordChange: true,
          temporaryPasswordProvided: Boolean(params.data.password),
          invitationUrlGenerated: true,
          deliveryChannel: mailDelivery.channel,
          previewPath: mailDelivery.previewPath ?? null,
        },
      },
    },
  })

  return {
    item: serializeUser(createdUser),
    invite: {
      email: createdUser.email,
      invitationUrl: passwordSetupUrl,
      requiresPasswordChange: true,
      copyText: buildInviteMessage(createdUser.email, passwordSetupUrl),
    },
  }
}

export async function updateUser(params: {
  userId: number
  data: UpdateUserInput
  actor: AuthUser
}) {
  const currentUser = await findUserWithCurrentJourney(params.userId)
  assertUserCompanyAccess(params.actor, currentUser.companyId, "update")

  if (params.data.role) {
    assertAssignableRole(params.actor, params.data.role)
  }

  if (
    params.actor.role !== "PLATFORM_ADMIN" &&
    params.data.companyId !== undefined &&
    params.data.companyId !== currentUser.companyId
  ) {
    throw new AppError(
      "You do not have permission to move this user to another company.",
      403
    )
  }

  const resolvedCompanyId =
    params.actor.role === "PLATFORM_ADMIN"
      ? (params.data.companyId ?? currentUser.companyId)
      : currentUser.companyId
  await assertJourneyCompany(params.data.journeyId, resolvedCompanyId)

  const user = await prisma.user.update({
    where: { id: params.userId },
    data: {
      companyId:
        params.actor.role === "PLATFORM_ADMIN"
          ? params.data.companyId
          : undefined,
      employeeCode: params.data.employeeCode,
      fullName: params.data.fullName,
      email: params.data.email?.trim().toLowerCase(),
      cpf: params.data.cpf,
      role: params.data.role,
      position: params.data.position,
      isActive: params.data.isActive,
      passwordHash: params.data.password
        ? await hashPassword(params.data.password)
        : undefined,
    },
  })

  await assignJourney({
    userId: user.id,
    journeyId: params.data.journeyId,
    validFrom: params.data.journeyValidFrom,
    actorUserId: params.actor.id,
  })

  const updatedUser = await findUserWithCurrentJourney(user.id)

  await recordAuditLog(prisma, {
    companyId: updatedUser.companyId,
    actorUserId: params.actor.id,
    entityType: "USER",
    entityId: updatedUser.id,
    action: "UPDATE",
    metadata: {
      summary: "Usuário atualizado",
      company: buildAuditCompany(updatedUser.company),
      changes: buildChangeSet(
        buildUserAuditSnapshot(currentUser),
        buildUserAuditSnapshot(updatedUser),
        [
          "companyId",
          "employeeCode",
          "fullName",
          "email",
          "cpf",
          "role",
          "position",
          "isActive",
          "journeyId",
        ]
      ),
      details: {
        passwordChanged: Boolean(params.data.password),
      },
    },
  })

  return serializeUser(updatedUser)
}

export async function deleteUser(userId: number, actor: AuthUser) {
  const currentUser = await findUserWithCurrentJourney(userId)
  assertUserCompanyAccess(actor, currentUser.companyId, "remove")

  await prisma.user.delete({ where: { id: userId } })
  await recordAuditLog(prisma, {
    companyId: currentUser.companyId,
    actorUserId: actor.id,
    entityType: "USER",
    entityId: currentUser.id,
    action: "DELETE",
    metadata: {
      summary: "Usuário removido",
      company: buildAuditCompany(currentUser.company),
      details: {
        before: buildUserAuditSnapshot(currentUser),
      },
    },
  })
}

async function assertJourneyCompany(
  journeyId: number | undefined,
  companyId: number
) {
  if (!journeyId) return

  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: journeyId },
  })

  if (journey.companyId !== companyId) {
    throw new AppError(
      "You do not have permission to assign this journey.",
      403
    )
  }
}

async function assignJourney(params: {
  userId: number
  journeyId?: number
  validFrom?: string
  actorUserId: number
}) {
  if (!params.journeyId) return

  const validFrom = getDateOnly(params.validFrom ?? new Date())
  await prisma.userJourneyAssignment.upsert({
    create: {
      userId: params.userId,
      journeyId: params.journeyId,
      createdById: params.actorUserId,
      validFrom,
    },
    update: {
      journeyId: params.journeyId,
      createdById: params.actorUserId,
      validTo: null,
    },
    where: {
      userId_validFrom: {
        userId: params.userId,
        validFrom,
      },
    },
  })
}

function assertAssignableRole(actor: AuthUser, requestedRole: string) {
  if (actor.role !== "PLATFORM_ADMIN" && requestedRole === "PLATFORM_ADMIN") {
    throw new AppError("You do not have permission to assign this role.", 403)
  }
}

function assertUserCompanyAccess(
  actor: AuthUser,
  companyId: number,
  action: "access" | "update" | "remove"
) {
  if (actor.role !== "PLATFORM_ADMIN" && companyId !== actor.companyId) {
    throw new AppError(
      `You do not have permission to ${action} this user.`,
      403
    )
  }
}

function generateTemporaryPassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("")
}

function buildInviteMessage(email: string, passwordSetupUrl: string) {
  return [
    "Convite de acesso ao PontoMax",
    "",
    `E-mail cadastrado: ${email}`,
    `URL de convite: ${passwordSetupUrl}`,
    "",
    "Use o link acima para definir sua senha e ativar seu acesso.",
  ].join("\n")
}
