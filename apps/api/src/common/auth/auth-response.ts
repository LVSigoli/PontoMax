import type { Company, User, UserRole } from '@prisma/client';

export function mapRoleToGroups(role: UserRole) {
  if (role === 'PLATFORM_ADMIN') return ['PLATFORM_ADMIN', 'PONTOMAX_ADMIN'];
  if (role === 'CLIENT_ADMIN') return ['CLIENT_ADMIN', 'COMPANY_ADMIN'];
  if (role === 'MANAGER') return ['MANAGER'];
  return ['EMPLOYEE'];
}

export function makeSessionResponse(params: {
  accessToken: string;
  refreshToken: string;
  user: User & { company?: Company | null };
}) {
  const { accessToken, refreshToken, user } = params;

  return {
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
    },
  };
}
