import { ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error.js';

export function errorHandlerMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Request validation failed.',
      details: error.flatten(),
    });
  }

  return response.status(500).json({
    message: 'Internal server error',
  });
}
