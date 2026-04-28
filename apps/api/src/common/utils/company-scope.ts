import type { Request } from 'express';

import { AppError } from '../errors/app-error.js';

export function getRequestCompanyId(request: Request, requestedCompanyId?: number) {
  if (!request.authUser) {
    throw new AppError('Authentication token is required.', 401);
  }

  if (request.authUser.role === 'PLATFORM_ADMIN') {
    if (requestedCompanyId) {
      return requestedCompanyId;
    }

    if (request.authUser.companyId) {
      return request.authUser.companyId;
    }

    throw new AppError('companyId is required for platform administrators.', 400);
  }

  return request.authUser.companyId;
}

export function getOptionalRequestCompanyId(request: Request, requestedCompanyId?: number) {
  if (!request.authUser) {
    throw new AppError('Authentication token is required.', 401);
  }

  if (request.authUser.role === 'PLATFORM_ADMIN') {
    return requestedCompanyId;
  }

  return request.authUser.companyId;
}
