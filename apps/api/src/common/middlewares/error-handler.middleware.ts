import { Prisma } from '@prisma/client';
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      const fieldLabel = targets.length ? targets.join(', ') : 'unique field';

      return response.status(409).json({
        message: `A record with the same ${fieldLabel} already exists.`,
      });
    }

    if (error.code === 'P2003') {
      const fieldName =
        typeof error.meta?.field_name === 'string'
          ? error.meta.field_name
          : 'related record';

      return response.status(409).json({
        message: `The selected ${fieldName} is invalid or no longer exists.`,
      });
    }
  }

  return response.status(500).json({
    message: 'Internal server error',
  });
}
