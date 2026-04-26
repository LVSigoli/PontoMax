import type { AuthUser } from './auth.types.js';

export interface AuthenticatedRequest {
  authUser?: AuthUser;
}
