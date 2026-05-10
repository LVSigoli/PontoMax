interface GetSubtitleParams {
  position?: string | null
  role?: string
}

export function getUserSubtitle(params: GetSubtitleParams) {
  const { position, role } = params

  if (position?.trim()) return position.trim()

  if (role === "PLATFORM_ADMIN") return "Contratante"

  if (role === "COMPANY_ADMIN") return "Administrador"

  return "Colaborador"
}
