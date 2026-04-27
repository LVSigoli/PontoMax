import type { NextFunction, Request, Response } from 'express';

import type { UserRole } from '../constants/domain-enums.js';
import { AppError } from '../errors/app-error.js';

export function requireRole(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.authUser) {
      return next(new AppError('Authentication token is required.', 401));
    }

    if (!roles.includes(request.authUser.role)) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }

    return next();
  };
}
