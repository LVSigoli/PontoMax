interface GetSubtitleParams {
  position?: string | null
  role?: string
}

export function getUserSubtitle(params: GetSubtitleParams) {
  const { position, role } = params

  if (position?.trim()) return position.trim()

  if (role === "PLATFORM_ADMIN") return "Proprietário"

  if (role === "CLIENT_ADMIN") return "Moderador"

  if (role === "COMPANY_ADMIN") return "Administrador"

  if (role === "MANAGER") return "Gestor"

  return "Colaborador"
}
