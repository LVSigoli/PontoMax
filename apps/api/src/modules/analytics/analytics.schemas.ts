import { z } from "zod"

import {
  ANALYTICS_PERIODS,
  DEFAULT_ANALYTICS_PERIOD,
} from "./analytics.types.js"

export const analyticsOverviewSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
})

export const analyticsDashboardSchema = z.object({
  query: z
    .object({
      companyId: z.coerce.number().int().positive().optional(),
      period: z.enum(ANALYTICS_PERIODS).default(DEFAULT_ANALYTICS_PERIOD),
      from: z.string().date().optional(),
      to: z.string().date().optional(),
    })
    .superRefine((query, context) => {
      if (query.period !== "custom") return

      if (!query.from) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from is required when period=custom.",
          path: ["from"],
        })
      }

      if (!query.to) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "to is required when period=custom.",
          path: ["to"],
        })
      }

      if (query.from && query.to && query.from > query.to) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from must be before or equal to to.",
          path: ["from"],
        })
      }
    }),
})

export type AnalyticsDashboardQuery = z.infer<
  typeof analyticsDashboardSchema
>["query"]
