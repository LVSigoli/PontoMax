type SWRKeyParams = Record<
  string,
  string | number | boolean | null | undefined
>

function toSearchParams(params?: SWRKeyParams) {
  if (!params) return ""

  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))

  if (!entries.length) return ""

  const searchParams = new URLSearchParams()

  entries.forEach(([key, value]) => {
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

export function buildSWRKey(resource: string, params?: SWRKeyParams) {
  const queryString = toSearchParams(params)

  if (!queryString) return resource

  return `${resource}?${queryString}`
}

export function swrKeyStartsWith(prefix: string) {
  return (key: unknown) =>
    typeof key === "string" && (key === prefix || key.startsWith(`${prefix}?`))
}

export const swrKeys = {
  auth: {
    currentUser: () => "auth/me",
  },
  companies: {
    list: () => "companies",
  },
  journeys: {
    list: (params?: { companyId?: number }) =>
      buildSWRKey("work-schedules", params),
  },
  users: {
    list: (params?: { companyId?: number }) => buildSWRKey("users", params),
  },
  holidays: {
    list: () => "holidays",
  },
  adjustmentRequests: {
    list: (params?: { status?: string; from?: string; to?: string }) =>
      buildSWRKey("adjustment-requests", params),
  },
  analytics: {
    dashboard: (params?: { companyId?: number }) =>
      buildSWRKey("analytics/dashboard", params),
  },
  timeRecords: {
    today: () => "time-records/today",
    teamToday: () => "time-records/team/today",
    summary: () => "time-records/summary",
  },
}
