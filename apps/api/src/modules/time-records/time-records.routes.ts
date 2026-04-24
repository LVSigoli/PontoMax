import { Router } from 'express';

export const timeRecordsRouter = Router();

timeRecordsRouter.get('/', (_request, response) => {
  response.json({
    message: 'Time records module scaffolded.',
    items: [],
  });
});
