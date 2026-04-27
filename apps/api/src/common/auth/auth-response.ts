import type { Company, User } from '@prisma/client';

import { toUserRole } from '../constants/domain-enums.js';

export function mapRoleToGroups(role: string) {
  const safeRole = toUserRole(role);

  if (safeRole === 'PLATFORM_ADMIN') return ['PLATFORM_ADMIN', 'PONTOMAX_ADMIN'];
  if (safeRole === 'CLIENT_ADMIN') return ['CLIENT_ADMIN', 'COMPANY_ADMIN'];
  if (safeRole === 'MANAGER') return ['MANAGER'];
  return ['EMPLOYEE'];
}

export function makeSessionResponse(params: {
  accessToken: string;
  refreshToken: string;
  user: User & { company?: Company | null };
}) {
  const { accessToken, refreshToken, user } = params;

  return {
    requiresPasswordChange: false,
    accessToken,
    refreshToken,
    user: {
      id: String(user.id),
      name: user.fullName,
      email: user.email,
      role: user.role,
      groups: mapRoleToGroups(user.role),
      companyId: user.companyId,
      companyName: user.company?.name ?? null,
      mustChangePassword: user.mustChangePassword,
    },
  };
}
