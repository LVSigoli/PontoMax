import { Router } from 'express';

export const authRouter = Router();

const demoUser = {
  id: 'demo-user',
  name: 'Lucas Sigoli',
  email: 'demo@pontomax.com.br',
  role: 'admin',
  groups: ['PONTOMAX_ADMIN'],
};

const demoCredentials = {
  email: 'demo@pontomax.com.br',
  password: '123456',
};

authRouter.post('/login', (request, response) => {
  const email =
    typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';

  if (!email || !password) {
    return response.status(400).json({
      message: 'Email and password are required.',
    });
  }

  if (email !== demoCredentials.email || password !== demoCredentials.password) {
    return response.status(401).json({
      message: 'Invalid email or password.',
    });
  }

  return response.json({
    accessToken: createToken(`${demoUser.id}:access`),
    refreshToken: createToken(`${demoUser.id}:refresh`),
    user: demoUser,
  });
});

authRouter.post('/refresh', (request, response) => {
  const refreshToken =
    typeof request.body?.refreshToken === 'string' ? request.body.refreshToken.trim() : '';

  if (!refreshToken) {
    return response.status(400).json({
      message: 'Refresh token is required.',
    });
  }

  return response.json({
    accessToken: createToken(`${demoUser.id}:access`),
    refreshToken,
    user: demoUser,
  });
});

function createToken(value: string) {
  return Buffer.from(`${value}:${Date.now()}`).toString('base64url');
}
