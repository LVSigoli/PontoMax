import { z } from "zod"

import { HOLIDAY_TYPES } from "../../common/constants/domain-enums.js"

export const listHolidaysSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    year: z.coerce.number().int().optional(),
  }),
})

export const holidayBodySchema = z.object({
  companyIds: z.array(z.coerce.number().int().positive()).optional(),
  name: z.string().min(2),
  date: z.string().date(),
  type: z.enum(HOLIDAY_TYPES),
  isActive: z.boolean().optional(),
})

export const createHolidaySchema = z.object({
  body: holidayBodySchema,
})

export const updateHolidaySchema = z.object({
  params: z.object({
    holidayId: z.coerce.number().int().positive(),
  }),
  body: holidayBodySchema.partial(),
})

export const holidayIdSchema = z.object({
  params: z.object({
    holidayId: z.coerce.number().int().positive(),
  }),
})

export type CreateHolidayInput = z.infer<typeof holidayBodySchema>
export type UpdateHolidayInput = Partial<CreateHolidayInput>
