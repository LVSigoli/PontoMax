import { z } from "zod"

import { USER_ROLES } from "../../common/constants/domain-enums.js"

export const listUsersSchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
})

export const userBodySchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  employeeCode: z.string().optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().min(11),
  password: z.string().min(6).optional(),
  role: z.enum(USER_ROLES),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
  journeyId: z.coerce.number().int().positive().optional(),
  journeyValidFrom: z.string().date().optional(),
})

export const createUserSchema = z.object({
  body: userBodySchema,
})

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  body: userBodySchema.partial(),
})

export const userIdSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
})

export type CreateUserInput = z.infer<typeof userBodySchema>
export type UpdateUserInput = Partial<CreateUserInput>
