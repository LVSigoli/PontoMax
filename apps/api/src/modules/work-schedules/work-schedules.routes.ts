import { Router } from 'express';

export const workSchedulesRouter = Router();

workSchedulesRouter.get('/', (_request, response) => {
  response.json({
    message: 'Work schedules module scaffolded.',
    items: [],
  });
});
