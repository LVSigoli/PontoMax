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
  createJourneySchema,
  journeyIdSchema,
  listWorkSchedulesSchema,
  updateJourneySchema,
} from "./work-schedules.schemas.js"
import {
  createWorkSchedule,
  deleteWorkSchedule,
  listWorkSchedules,
  updateWorkSchedule,
} from "./work-schedules.service.js"

export const workSchedulesRouter = Router()

workSchedulesRouter.use(authenticate)

workSchedulesRouter.get(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(listWorkSchedulesSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )
    response.json({ items: await listWorkSchedules(companyId) })
  })
)

workSchedulesRouter.post(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(createJourneySchema),
  asyncHandler(async (request, response) => {
    const item = await createWorkSchedule({
      companyId: getRequestCompanyId(request, request.body.companyId),
      actorUserId: request.authUser!.id,
      data: request.body,
    })
    response.status(201).json({ item })
  })
)

workSchedulesRouter.patch(
  "/:journeyId",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(updateJourneySchema),
  asyncHandler(async (request, response) => {
    const item = await updateWorkSchedule({
      journeyId: Number(request.params.journeyId),
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
      data: request.body,
    })
    response.json({ item })
  })
)

workSchedulesRouter.delete(
  "/:journeyId",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(journeyIdSchema),
  asyncHandler(async (request, response) => {
    await deleteWorkSchedule({
      journeyId: Number(request.params.journeyId),
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
    })
    response.status(204).send()
  })
)
