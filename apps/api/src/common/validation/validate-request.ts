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

      request.body = parsed.body ?? request.body;
      request.query = parsed.query ?? request.query;
      request.params = parsed.params ?? request.params;

      next();
    } catch (error) {
      next(error);
    }
  };
}
