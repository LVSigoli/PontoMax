import { Router } from 'express';

import { authRouter } from './auth/auth.routes.js';
import { companiesRouter } from './companies/companies.routes.js';
import { holidaysRouter } from './holidays/holidays.routes.js';
import { timeRecordsRouter } from './time-records/time-records.routes.js';
import { usersRouter } from './users/users.routes.js';
import { workSchedulesRouter } from './work-schedules/work-schedules.routes.js';

export const modulesRouter = Router();

modulesRouter.use('/auth', authRouter);
modulesRouter.use('/companies', companiesRouter);
modulesRouter.use('/holidays', holidaysRouter);
modulesRouter.use('/time-records', timeRecordsRouter);
modulesRouter.use('/users', usersRouter);
modulesRouter.use('/work-schedules', workSchedulesRouter);
