import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';
import { getDateOnly } from '../../common/utils/date.js';
import { getOptionalRequestCompanyId } from '../../common/utils/company-scope.js';
import { getAnalyticsDashboard } from './analytics.service.js';

export const analyticsRouter = Router();

const analyticsQuerySchema = z.object({
  query: z.object({
    companyId: z.coerce.number().int().positive().optional(),
  }),
});

analyticsRouter.use(authenticate, requireRole('PLATFORM_ADMIN', 'CLIENT_ADMIN', 'COMPANY_ADMIN', 'MANAGER'));

analyticsRouter.get(
  '/overview',
  validateRequest(analyticsQuerySchema),
  asyncHandler(async (request, response) => {
    const today = getDateOnly(new Date());
    const companyId = getOptionalRequestCompanyId(
      request,
      request.query.companyId ? Number(request.query.companyId) : undefined,
    );

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
            date: today,
          },
          include: {
            timeEntries: {
              where: {
                status: 'ACTIVE',
              },
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

    const presentEmployees = todayWorkdays.filter((workday) =>
      workday.timeEntries.some((entry) => entry.kind === 'ENTRY'),
    ).length;
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
  validateRequest(analyticsQuerySchema),
  asyncHandler(async (request, response) => {
    const dashboard = await getAnalyticsDashboard(
      getOptionalRequestCompanyId(
        request,
        request.query.companyId ? Number(request.query.companyId) : undefined,
      ),
    );

    response.json(dashboard);
  }),
);
