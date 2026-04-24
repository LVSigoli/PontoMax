import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (_request, response) => {
  response.status(501).json({
    message: 'Auth login endpoint scaffolded but not implemented yet.',
  });
});

authRouter.post('/refresh', (_request, response) => {
  response.status(501).json({
    message: 'Auth refresh endpoint scaffolded but not implemented yet.',
  });
});
