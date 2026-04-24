import { Router } from 'express';

export const companiesRouter = Router();

companiesRouter.get('/', (_request, response) => {
  response.json({
    message: 'Companies module scaffolded.',
    items: [],
  });
});
