import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types.js';

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>) {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    },
  );
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>) {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function generateOpaqueToken() {
  return crypto.randomBytes(48).toString('hex');
}
