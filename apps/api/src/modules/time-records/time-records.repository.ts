import { prisma } from "../../lib/prisma.js"

export async function findApplicableHoliday(companyId: number, date: Date) {
  const companyHoliday = await prisma.holiday.findFirst({
    where: {
      date,
      isActive: true,
      companyAssignments: {
        some: {
          companyId,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  })

  if (companyHoliday) {
    return companyHoliday
  }

  return prisma.holiday.findFirst({
    where: {
      date,
      isActive: true,
      type: "NATIONAL",
    },
    orderBy: {
      id: "asc",
    },
  })
}

export async function getJourneyAssignmentsForRange(params: {
  userId: number
  from: Date
  to: Date
}) {
  return prisma.userJourneyAssignment.findMany({
    where: {
      userId: params.userId,
      validFrom: {
        lte: params.to,
      },
      OR: [{ validTo: null }, { validTo: { gte: params.from } }],
    },
    include: {
      journey: true,
    },
    orderBy: {
      validFrom: "asc",
    },
  })
}

export async function getHolidayDateKeysForRange(params: {
  companyId: number
  from: Date
  to: Date
}) {
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: params.from,
        lte: params.to,
      },
      isActive: true,
      OR: [
        {
          type: "NATIONAL",
        },
        {
          companyAssignments: {
            some: {
              companyId: params.companyId,
            },
          },
        },
      ],
    },
    select: {
      date: true,
    },
  })

  return holidays
}
