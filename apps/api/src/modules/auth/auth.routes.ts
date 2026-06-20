import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  resetPasswordSchema,
} from "./auth.schemas.js"
import {
  getCurrentUser,
  login,
  logout,
  refreshSession,
} from "./auth-session.service.js"
import {
  forgotPasswordResponseMessage,
  requestPasswordReset,
  resetPassword,
} from "./password-flow.service.js"

export const authRouter = Router()

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (request, response) => {
    response.json(
      await login({
        email: request.body.email,
        password: request.body.password,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      })
    )
  })
)

authRouter.post(
  "/refresh",
  validateRequest(refreshSchema),
  asyncHandler(async (request, response) => {
    response.json(await refreshSession(request.body.refreshToken))
  })
)

authRouter.post(
  "/logout",
  validateRequest(logoutSchema),
  asyncHandler(async (request, response) => {
    await logout(request.body.refreshToken)
    response.status(204).send()
  })
)

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (request, response) => {
    response.json({
      user: await getCurrentUser(request.authUser!.id),
    })
  })
)

authRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (request, response) => {
    await requestPasswordReset(request.body.email)
    response.json({ message: forgotPasswordResponseMessage })
  })
)

authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  asyncHandler(async (request, response) => {
    await resetPassword(request.body.token, request.body.password)
    response.status(204).send()
  })
)
