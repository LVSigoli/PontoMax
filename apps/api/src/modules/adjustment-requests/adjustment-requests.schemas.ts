import { z } from "zod"

import {
  ADJUSTMENT_ACTION_TYPES,
  ADJUSTMENT_REQUEST_STATUSES,
  TIME_ENTRY_KINDS,
} from "../../common/constants/domain-enums.js"

export const createAdjustmentRequestSchema = z.object({
  body: z.object({
    workdayDate: z.string().date(),
    justification: z.string().min(5),
    userId: z.coerce.number().int().positive().optional(),
    records: z
      .array(
        z.object({
          timeEntryId: z.coerce.number().int().positive().optional(),
          actionType: z.enum(ADJUSTMENT_ACTION_TYPES),
          targetKind: z.enum(TIME_ENTRY_KINDS),
          originalRecordedAt: z.string().datetime().optional(),
          newRecordedAt: z.string().datetime().optional(),
          reason: z.string().optional(),
        })
      )
      .min(1),
  }),
})

export const listAdjustmentRequestsSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
    status: z.enum(ADJUSTMENT_REQUEST_STATUSES).optional(),
    userId: z.coerce.number().int().positive().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }),
})

export const reviewAdjustmentRequestSchema = z.object({
  params: z.object({
    requestId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reviewNotes: z.string().optional(),
  }),
})

export type CreateAdjustmentRequestInput = z.infer<
  typeof createAdjustmentRequestSchema
>["body"]
