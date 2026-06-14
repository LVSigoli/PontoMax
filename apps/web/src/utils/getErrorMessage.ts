import axios from "axios"

const DEFAULT_FALLBACK =
  "Ocorreu um erro inesperado. Tente novamente em instantes."

const FRIENDLY_MESSAGES: Array<{ match: RegExp; message: string }> = [
  {
    match: /^Request validation failed\.$/i,
    message: "Os dados enviados sao invalidos. Revise os campos e tente novamente.",
  },
  {
    match: /^Internal server error$/i,
    message: DEFAULT_FALLBACK,
  },
  {
    match: /^Authentication token is required\.$/i,
    message: "Sua sessao expirou. Entre novamente.",
  },
  {
    match: /^Invalid or expired authentication token\.$/i,
    message: "Sua sessao expirou. Entre novamente.",
  },
  {
    match: /^Refresh token is invalid or expired\.$/i,
    message: "Sua sessao expirou. Entre novamente.",
  },
  {
    match: /^You do not have permission to access this resource\.$/i,
    message: "Voce nao tem permissao para realizar esta acao.",
  },
  {
    match: /^You do not have permission to review this request\.$/i,
    message: "Voce nao tem permissao para revisar esta solicitacao.",
  },
  {
    match: /^You do not have permission to update this company\.$/i,
    message: "Voce nao tem permissao para atualizar esta empresa.",
  },
  {
    match: /^You do not have permission to update this user\.$/i,
    message: "Voce nao tem permissao para atualizar este usuario.",
  },
  {
    match: /^You do not have permission to remove this user\.$/i,
    message: "Voce nao tem permissao para remover este usuario.",
  },
  {
    match: /^You do not have permission to update this journey\.$/i,
    message: "Voce nao tem permissao para atualizar esta jornada.",
  },
  {
    match: /^You do not have permission to remove this journey\.$/i,
    message: "Voce nao tem permissao para remover esta jornada.",
  },
  {
    match: /^A record with the same .* already exists\.$/i,
    message: "Ja existe um registro com esses dados.",
  },
  {
    match: /^The selected .* is invalid or no longer exists\.$/i,
    message: "O item selecionado nao e valido ou nao existe mais.",
  },
  {
    match: /^The approved adjustment would create an invalid time entry sequence\.$/i,
    message: "A aprovacao deste ajuste deixaria a sequencia de batidas invalida.",
  },
]

const TECHNICAL_PATTERNS: RegExp[] = [
  /cannot read properties of undefined/i,
  /cannot read property/i,
  /cannot destructure property .* of undefined/i,
  /cannot convert undefined or null to object/i,
  /network error/i,
  /failed to fetch/i,
  /request failed with status code \d+/i,
]

function normalizeCandidateMessage(message: string) {
  const trimmed = message.trim()

  if (!trimmed) return null

  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return null
  }

  const translated = FRIENDLY_MESSAGES.find(({ match }) => match.test(trimmed))

  return translated?.message ?? trimmed
}

function firstStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = firstStringValue(item)

      if (nested) return nested
    }

    return null
  }

  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of ["message", "error", "title", "detail"]) {
    const candidate = firstStringValue(record[key])

    if (candidate) return candidate
  }

  return null
}

function getFriendlyFallback(status?: number, fallback?: string) {
  if (status === 400 || status === 422) {
    return "Os dados enviados sao invalidos. Revise os campos e tente novamente."
  }

  if (status === 401) {
    return "Sua sessao expirou. Entre novamente."
  }

  if (status === 403) {
    return "Voce nao tem permissao para realizar esta acao."
  }

  if (status === 404) {
    return "O recurso solicitado nao foi encontrado."
  }

  if (status === 409) {
    return "Nao foi possivel concluir a operacao porque os dados ja estao em uso."
  }

  return fallback?.trim() || DEFAULT_FALLBACK
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const candidate = firstStringValue(error.response?.data)
    const message = candidate ? normalizeCandidateMessage(candidate) : null

    if (message) {
      return message
    }

    return getFriendlyFallback(error.response?.status, fallback)
  }

  if (error instanceof Error) {
    const message = normalizeCandidateMessage(error.message)

    if (message) {
      return message
    }
  }

  return getFriendlyFallback(undefined, fallback)
}
