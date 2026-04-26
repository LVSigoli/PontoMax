import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../common/auth/auth.middleware.js';
import { requireRole } from '../../common/auth/require-role.middleware.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validateRequest } from '../../common/validation/validate-request.js';
import { prisma } from '../../lib/prisma.js';

export const companiesRouter = Router();

const listCompaniesSchema = z.object({
  query: z.object({
    clientId: z.coerce.number().int().positive().optional(),
  }),
});

const companySchema = z.object({
  body: z.object({
    clientId: z.coerce.number().int().positive(),
    name: z.string().min(2),
    legalName: z.string().min(2),
    tradeName: z.string().optional(),
    cnpj: z.string().min(14),
    timezone: z.string().min(3).default('America/Sao_Paulo'),
    isActive: z.boolean().optional(),
  }),
});

const updateCompanySchema = z.object({
  body: companySchema.shape.body.partial(),
});

const companyIdSchema = z.object({
  params: z.object({
    companyId: z.coerce.number().int().positive(),
  }),
});

companiesRouter.use(authenticate);

companiesRouter.get(
  '/',
  validateRequest(listCompaniesSchema),
  asyncHandler(async (request, response) => {
    if (request.authUser!.role === 'PLATFORM_ADMIN') {
      const companies = await prisma.company.findMany({
        where: {
          clientId: request.query.clientId ? Number(request.query.clientId) : undefined,
        },
        include: {
          client: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      response.json({
        items: companies.map((company) => ({
          id: company.id,
          clientId: company.clientId,
          clientName: company.client.name,
          name: company.name,
          legalName: company.legalName,
          tradeName: company.tradeName,
          cnpj: company.cnpj,
          timezone: company.timezone,
          isActive: company.isActive,
          employees: company._count.users,
        })),
      });

      return;
    }

    const company = await prisma.company.findUniqueOrThrow({
      where: {
        id: request.authUser!.companyId,
      },
      include: {
        client: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    response.json({
      items: [
        {
          id: company.id,
          clientId: company.clientId,
          clientName: company.client.name,
          name: company.name,
          legalName: company.legalName,
          tradeName: company.tradeName,
          cnpj: company.cnpj,
          timezone: company.timezone,
          isActive: company.isActive,
          employees: company._count.users,
        },
      ],
    });
  }),
);

companiesRouter.post(
  '/',
  requireRole('PLATFORM_ADMIN'),
  validateRequest(companySchema),
  asyncHandler(async (request, response) => {
    const company = await prisma.company.create({
      data: request.body,
    });

    response.status(201).json({ item: company });
  }),
);

companiesRouter.patch(
  '/:companyId',
  validateRequest(companyIdSchema.merge(updateCompanySchema)),
  asyncHandler(async (request, response) => {
    const companyId = Number(request.params.companyId);

    if (request.authUser!.role !== 'PLATFORM_ADMIN' && request.authUser!.companyId !== companyId) {
      throw new AppError('You do not have permission to update this company.', 403);
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: request.body,
    });

    response.json({ item: company });
  }),
);
