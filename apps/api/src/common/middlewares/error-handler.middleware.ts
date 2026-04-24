import type { NextFunction, Request, Response } from 'express';

export function errorHandlerMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  return response.status(500).json({
    message: 'Internal server error',
  });
}
