import type { Prisma } from "@prisma/client"

export const holidayInclude = {
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
        name: "asc" as const,
      },
    },
  },
} satisfies Prisma.HolidayInclude

export type HolidayWithCompanies = Prisma.HolidayGetPayload<{
  include: typeof holidayInclude
}>

export interface HolidayScope {
  date: Date
  type: string
  companyIds: number[]
}
