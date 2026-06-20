import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import {
  getOptionalRequestCompanyId,
  getRequestCompanyId,
} from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  userIdSchema,
} from "./users.schemas.js"
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "./users.service.js"

export const usersRouter = Router()

usersRouter.use(authenticate)
usersRouter.use(requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"))

usersRouter.get(
  "/",
  validateRequest(listUsersSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )
    response.json({ items: await listUsers(companyId) })
  })
)

usersRouter.post(
  "/",
  validateRequest(createUserSchema),
  asyncHandler(async (request, response) => {
    const result = await createUser({
      data: request.body,
      companyId: getRequestCompanyId(request, request.body.companyId),
      actor: request.authUser!,
    })
    response.status(201).json(result)
  })
)

usersRouter.patch(
  "/:userId",
  validateRequest(updateUserSchema),
  asyncHandler(async (request, response) => {
    const item = await updateUser({
      userId: Number(request.params.userId),
      data: request.body,
      actor: request.authUser!,
    })
    response.json({ item })
  })
)

usersRouter.get(
  "/:userId",
  validateRequest(userIdSchema),
  asyncHandler(async (request, response) => {
    const item = await getUser(Number(request.params.userId), request.authUser!)
    response.json({ item })
  })
)

usersRouter.delete(
  "/:userId",
  validateRequest(userIdSchema),
  asyncHandler(async (request, response) => {
    await deleteUser(Number(request.params.userId), request.authUser!)
    response.status(204).send()
  })
)
