import { z } from "zod"

import { TIME_ENTRY_KINDS } from "../../common/constants/domain-enums.js"

const userScopeSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
})

export const listTimeRecordsSchema = z.object({
  query: userScopeSchema.extend({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
})

export const workdayOverviewSchema = z.object({
  query: userScopeSchema.extend({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
})

export const todayWorkdaySchema = z.object({
  query: userScopeSchema,
})

export const workdaySummarySchema = z.object({
  query: userScopeSchema.extend({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
})

export const registerTimeEntrySchema = z.object({
  body: z.object({
    recordedAt: z.string().datetime().optional(),
    kind: z.enum(TIME_ENTRY_KINDS).optional(),
    timezone: z.string().optional(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracyMeters: z.number().nonnegative().optional(),
      })
      .optional(),
  }),
})
