import { z } from "zod"

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  }),
})

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
})
