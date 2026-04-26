import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error.js';
import { verifyAccessToken } from './token.service.js';

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is required.', 401));
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);

    request.authUser = {
      id: payload.id,
      companyId: payload.companyId,
      role: payload.role,
      email: payload.email,
    };

    return next();
  } catch {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
}
