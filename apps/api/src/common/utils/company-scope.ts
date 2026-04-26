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

    throw new AppError('companyId is required for platform administrators.', 400);
  }

  return request.authUser.companyId;
}
