import type { Company, User } from '@prisma/client';

import { toUserRole } from '../constants/domain-enums.js';

export function mapRoleToGroups(role: string) {
  const safeRole = toUserRole(role);

  return [safeRole];
}

export function makeSessionResponse(params: {
  accessToken: string;
  refreshToken: string;
  user: User & { company?: Company | null };
}) {
  const { accessToken, refreshToken, user } = params;
  const safeRole = toUserRole(user.role);

  return {
    requiresPasswordChange: false,
    accessToken,
    refreshToken,
    user: {
      id: String(user.id),
      name: user.fullName,
      email: user.email,
      position: user.position ?? null,
      role: safeRole,
      groups: mapRoleToGroups(safeRole),
      companyId: user.companyId,
      companyName: user.company?.name ?? null,
      mustChangePassword: user.mustChangePassword,
    },
  };
}
