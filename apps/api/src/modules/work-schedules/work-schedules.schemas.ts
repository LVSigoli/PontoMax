import { z } from "zod"

export const listWorkSchedulesSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
})

export const journeyBodySchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  scaleCode: z.string().min(2),
  flexibleSchedule: z.boolean().optional(),
  dailyWorkMinutes: z.coerce.number().int().nonnegative(),
  weeklyWorkMinutes: z.coerce.number().int().nonnegative().optional(),
  expectedEntryTime: z.string().nullable().optional(),
  expectedExitTime: z.string().nullable().optional(),
  breakMinutes: z.coerce.number().int().nonnegative().optional(),
  toleranceMinutes: z.coerce.number().int().nonnegative().optional(),
  nightShift: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const createJourneySchema = z.object({
  body: journeyBodySchema,
})

export const updateJourneySchema = z.object({
  params: z.object({
    journeyId: z.coerce.number().int().positive(),
  }),
  body: journeyBodySchema.partial(),
})

export const journeyIdSchema = z.object({
  params: z.object({
    journeyId: z.coerce.number().int().positive(),
  }),
})
