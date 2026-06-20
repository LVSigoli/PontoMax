import { prisma } from "../../lib/prisma.js"

export const currentJourneyInclude = {
  company: true,
  journeyAssignments: {
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "desc" as const,
    },
    take: 1,
  },
}

export function findUserWithCurrentJourney(userId: number) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: currentJourneyInclude,
  })
}

export function listUsersWithCurrentJourney(companyId?: number) {
  return prisma.user.findMany({
    where: { companyId },
    include: currentJourneyInclude,
    orderBy: {
      fullName: "asc",
    },
  })
}
