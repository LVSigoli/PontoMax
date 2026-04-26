import type { UserRole } from '@prisma/client';

export interface AuthUser {
  id: number;
  companyId: number;
  role: UserRole;
  email: string;
}

export interface AccessTokenPayload extends AuthUser {
  type: 'access';
}

export interface RefreshTokenPayload extends AuthUser {
  sessionId: number;
  sessionToken: string;
  type: 'refresh';
}
