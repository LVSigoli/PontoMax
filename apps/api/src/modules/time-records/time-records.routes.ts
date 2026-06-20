import { Router } from "express"

import { authenticate } from "../../common/auth/auth.middleware.js"
import { teamTimeRecordsRouter } from "./team-time-records.routes.js"
import { timeEntryRouter } from "./time-entry.routes.js"
import { userTimeRecordsRouter } from "./user-time-records.routes.js"

export const timeRecordsRouter = Router()

timeRecordsRouter.use(authenticate)
timeRecordsRouter.use(userTimeRecordsRouter)
timeRecordsRouter.use(timeEntryRouter)
timeRecordsRouter.use(teamTimeRecordsRouter)
