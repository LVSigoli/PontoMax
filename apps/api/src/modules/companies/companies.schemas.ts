import { z } from "zod"

export const listCompaniesSchema = z.object({
  query: z.object({
    clientId: z.coerce.number().int().positive().optional(),
  }),
})

export const companyBodySchema = z.object({
  clientId: z.coerce.number().int().positive(),
  name: z.string().min(2),
  legalName: z.string().min(2),
  tradeName: z.string().optional(),
  cnpj: z.string().min(14),
  timezone: z.string().min(3).default("America/Sao_Paulo"),
  isActive: z.boolean().optional(),
})

export const createCompanySchema = z.object({
  body: companyBodySchema,
})

export const updateCompanySchema = z.object({
  params: z.object({
    companyId: z.coerce.number().int().positive(),
  }),
  body: companyBodySchema.partial(),
})

export const companyIdSchema = z.object({
  params: z.object({
    companyId: z.coerce.number().int().positive(),
  }),
})
