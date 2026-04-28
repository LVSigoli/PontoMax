import { Router } from 'express';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { prisma } from '../../lib/prisma.js';
import { startOfDay } from '../../common/utils/date.js';
import { getOptionalRequestCompanyId } from '../../common/utils/company-scope.js';
import { getAnalyticsDashboard } from './analytics.service.js';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate, requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'COMPANY_ADMIN', 'MANAGER'));

analyticsRouter.get(
  '/overview',
  asyncHandler(async (request, response) => {
    const today = startOfDay(new Date());
    const companyId = getOptionalRequestCompanyId(request);

    const [companyEmployees, todayWorkdays, pendingAdjustments, inconsistentWorkdays] =
      await Promise.all([
        prisma.user.count({
          where: {
            companyId: companyId ?? undefined,
            isActive: true,
          },
        }),
        prisma.workday.findMany({
          where: {
            companyId: companyId ?? undefined,
            date: {
              gte: today,
            },
          },
        }),
        prisma.adjustmentRequest.count({
          where: {
            companyId: companyId ?? undefined,
            status: 'PENDING',
          },
        }),
        prisma.workday.count({
          where: {
            companyId: companyId ?? undefined,
            status: 'INCONSISTENT',
          },
        }),
      ]);

    const presentEmployees = todayWorkdays.filter((workday) => workday.workedMinutes > 0).length;
    const overtimeMinutes = todayWorkdays.reduce((total, workday) => total + workday.overtimeMinutes, 0);
    const totalWorkedHours = todayWorkdays.reduce((total, workday) => total + workday.workedMinutes, 0) / 60;

    response.json({
      metrics: {
        presentEmployees,
        companyEmployees,
        overtimeMinutes,
        pendingAdjustments,
        inconsistentWorkdays,
        totalWorkedHours,
      },
    });
  }),
);

analyticsRouter.get(
  '/dashboard',
  asyncHandler(async (request, response) => {
    const dashboard = await getAnalyticsDashboard(getOptionalRequestCompanyId(request));

    response.json(dashboard);
  }),
);
