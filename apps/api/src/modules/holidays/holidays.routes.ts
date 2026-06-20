import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  createHolidaySchema,
  holidayIdSchema,
  listHolidaysSchema,
  updateHolidaySchema,
} from "./holidays.schemas.js"
import {
  createHoliday,
  deleteHoliday,
  listHolidays,
  updateHoliday,
} from "./holidays.service.js"

export const holidaysRouter = Router()

holidaysRouter.use(authenticate)

holidaysRouter.get(
  "/",
  validateRequest(listHolidaysSchema),
  asyncHandler(async (request, response) => {
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined
    )
    const items = await listHolidays({
      companyId,
      year: request.query.year ? Number(request.query.year) : undefined,
    })
    response.json({ items })
  })
)

holidaysRouter.post(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(createHolidaySchema),
  asyncHandler(async (request, response) => {
    const item = await createHoliday({
      data: request.body,
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
    })
    response.status(201).json({ item })
  })
)

holidaysRouter.patch(
  "/:holidayId",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(updateHolidaySchema),
  asyncHandler(async (request, response) => {
    const item = await updateHoliday({
      holidayId: Number(request.params.holidayId),
      data: request.body,
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
    })
    response.json({ item })
  })
)

holidaysRouter.delete(
  "/:holidayId",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(holidayIdSchema),
  asyncHandler(async (request, response) => {
    await deleteHoliday({
      holidayId: Number(request.params.holidayId),
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
    })
    response.status(204).send()
  })
)
