import { Router } from "express"

import { recordAuditLog } from "../../common/audit/index.js"
import { asyncHandler } from "../../common/utils/async-handler.js"
import { validateRequest } from "../../common/validation/validate-request.js"
import { prisma } from "../../lib/prisma.js"
import { registerTimeEntrySchema } from "./time-records.schemas.js"
import {
  createTimeEntry,
  serializeTimeEntry,
  serializeWorkday,
} from "./time-records.service.js"

export const timeEntryRouter = Router()

timeEntryRouter.post(
  "/register",
  validateRequest(registerTimeEntrySchema),
  asyncHandler(async (request, response) => {
    const result = await createTimeEntry({
      companyId: request.authUser!.companyId,
      location: request.body.location,
      userId: request.authUser!.id,
      recordedAt: request.body.recordedAt
        ? new Date(request.body.recordedAt)
        : new Date(),
      source: "WEB",
      kind: request.body.kind,
      timezone: request.body.timezone ?? "America/Sao_Paulo",
    })
    const serializedEntry = serializeTimeEntry(result.entry)
    const serializedWorkday = serializeWorkday(result.workday)

    await recordAuditLog(prisma, {
      companyId: request.authUser!.companyId,
      actorUserId: request.authUser!.id,
      entityType: "TIME_RECORD",
      entityId: result.entry.id,
      action: "REGISTER",
      metadata: {
        summary: "Ponto registrado",
        details: {
          workdayId: result.workday.id,
          kind: result.entry.kind,
          source: result.entry.source,
          recordedAt: result.entry.recordedAt,
          workdayStatus: result.workday.status,
          ...(serializedEntry.location
            ? {
                location: serializedEntry.location,
              }
            : {}),
        },
      },
    })

    response.status(201).json({
      entry: serializedEntry,
      workday: serializedWorkday,
    })
  })
)
