export function getUserInitials(name: string) {
  const sanitizedName = name.trim()

  if (!sanitizedName) return "US"

  const parts = sanitizedName.split(/\s+/).filter(Boolean)

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}
