import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

type ValidSchema = ZodType;

export function validateRequest(schema: ValidSchema): RequestHandler {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: request.body,
        query: request.query,
        params: request.params,
      })) as {
        body?: Request['body'];
        query?: Request['query'];
        params?: Request['params'];
      };

      if (parsed.body && typeof parsed.body === 'object') {
        Object.assign(request.body as Record<string, unknown>, parsed.body);
      }

      if (parsed.query && typeof parsed.query === 'object') {
        Object.assign(request.query as Record<string, unknown>, parsed.query);
      }

      if (parsed.params && typeof parsed.params === 'object') {
        Object.assign(request.params as Record<string, unknown>, parsed.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
