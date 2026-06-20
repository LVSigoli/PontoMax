import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { requireRole } from "../../common/auth/require-role.middleware.js"
import type { AdjustmentRequestStatus } from "../../common/constants/domain-enums.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { getOptionalRequestCompanyId } from "../../common/utils/company-scope.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import {
  createAdjustmentRequestSchema,
  listAdjustmentRequestsSchema,
  reviewAdjustmentRequestSchema,
} from "./adjustment-requests.schemas.js"
import {
  createAdjustmentRequest,
  listAdjustmentRequests,
} from "./adjustment-requests.service.js"
import { reviewAdjustmentRequest } from "./adjustment-review.service.js"

export const adjustmentRequestsRouter = Router()

adjustmentRequestsRouter.use(authenticate)

adjustmentRequestsRouter.get(
  "/",
  validateRequest(listAdjustmentRequestsSchema),
  asyncHandler(async (request, response) => {
    const items = await listAdjustmentRequests({
      actor: request.authUser!,
      companyId: getOptionalRequestCompanyId(
        request,
        request.query.companyId ? Number(request.query.companyId) : undefined
      ),
      status: request.query.status as AdjustmentRequestStatus | undefined,
      userId: request.query.userId ? Number(request.query.userId) : undefined,
      from: request.query.from as string | undefined,
      to: request.query.to as string | undefined,
    })
    response.json({ items })
  })
)

adjustmentRequestsRouter.post(
  "/",
  validateRequest(createAdjustmentRequestSchema),
  asyncHandler(async (request, response) => {
    const item = await createAdjustmentRequest({
      actor: request.authUser!,
      data: request.body,
    })
    response.status(201).json({ item })
  })
)

adjustmentRequestsRouter.patch(
  "/:requestId/review",
  requireRole("PLATFORM_ADMIN", "COMPANY_ADMIN"),
  validateRequest(reviewAdjustmentRequestSchema),
  asyncHandler(async (request, response) => {
    const item = await reviewAdjustmentRequest({
      requestId: Number(request.params.requestId),
      status: request.body.status,
      reviewNotes: request.body.reviewNotes,
      actor: request.authUser!,
    })
    response.json({ item })
  })
)
