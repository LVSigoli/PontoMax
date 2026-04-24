import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/', (_request, response) => {
  response.json({
    message: 'Users module scaffolded.',
    items: [],
  });
});
