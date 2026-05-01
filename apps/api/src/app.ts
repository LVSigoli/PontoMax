import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandlerMiddleware } from './common/middlewares/error-handler.middleware.js';
import { notFoundMiddleware } from './common/middlewares/not-found.middleware.js';
import { env } from './config/env.js';
import { modulesRouter } from './modules/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'ponto-max-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(`/${env.API_PREFIX}`, modulesRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}

export const app = createApp();

export default app;
