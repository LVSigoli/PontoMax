import type { Request } from "express"

import { AppError } from "../../common/errors/app-error.js"
import { prisma } from "../../lib/prisma.js"

export async function resolveTimeRecordAccess(request: Request) {
  const requestedUserId = request.query.userId
    ? Number(request.query.userId)
    : undefined
  const userId = requestedUserId ?? request.authUser!.id

  if (
    requestedUserId &&
    requestedUserId !== request.authUser!.id &&
    !["PLATFORM_ADMIN", "COMPANY_ADMIN"].includes(request.authUser!.role)
  ) {
    throw new AppError(
      "You do not have permission to access records from another user.",
      403
    )
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      company: true,
    },
  })

  if (
    request.authUser!.role !== "PLATFORM_ADMIN" &&
    user.companyId !== request.authUser!.companyId
  ) {
    throw new AppError(
      "You do not have permission to access these records.",
      403
    )
  }

  return {
    user,
    userId,
  }
}
