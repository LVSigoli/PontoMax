import { Router } from 'express';

export const holidaysRouter = Router();

holidaysRouter.get('/', (_request, response) => {
  response.json({
    message: 'Holidays module scaffolded.',
    items: [],
  });
});
