import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  companyIdSchema,
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from "./companies.schemas.js"
import {
  createCompany,
  deleteCompany,
  listCompanies,
  updateCompany,
} from "./companies.service.js"

export const companiesRouter = Router()

companiesRouter.use(authenticate)

companiesRouter.get(
  "/",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(listCompaniesSchema),
  asyncHandler(async (request, response) => {
    const items = await listCompanies({
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      clientId: request.query.clientId
        ? Number(request.query.clientId)
        : undefined,
    })

    response.json({ items })
  })
)

companiesRouter.post(
  "/",
  requireRole("PLATFORM_ADMIN"),
  validateRequest(createCompanySchema),
  asyncHandler(async (request, response) => {
    const item = await createCompany(request.body, request.authUser!.id)
    response.status(201).json({ item })
  })
)

companiesRouter.patch(
  "/:companyId",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(updateCompanySchema),
  asyncHandler(async (request, response) => {
    const item = await updateCompany({
      companyId: Number(request.params.companyId),
      role: request.authUser!.role,
      authCompanyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
      data: request.body,
    })

    response.json({ item })
  })
)

companiesRouter.delete(
  "/:companyId",
  requireRole("PLATFORM_ADMIN"),
  validateRequest(companyIdSchema),
  asyncHandler(async (request, response) => {
    await deleteCompany(Number(request.params.companyId), request.authUser!.id)
    response.status(204).send()
  })
)
