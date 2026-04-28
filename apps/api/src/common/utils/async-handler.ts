import { AppError } from '../errors/app-error.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncHandler(
  callback: (request: Request, response: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return async (request, response, next) => {
    try {
      await callback(request, response, next);
    } catch (error) {
      next(normalizeRouteError(error));
    }
  };
}

function normalizeRouteError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message || 'Internal server error', 500);
  }

  return new AppError('Internal server error', 500);
}
