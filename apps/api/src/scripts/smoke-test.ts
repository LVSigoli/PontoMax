const port = process.env.PORT ?? "3333"
const apiPrefix = process.env.API_PREFIX ?? "api"
const baseUrl = `http://localhost:${port}`

interface Endpoint {
  method: "GET" | "POST"
  path: string
  expectedStatus: number
  body?: Record<string, string>
  token?: string
}

async function run() {
  console.log(`Running smoke test against ${baseUrl}`)

  await assertEndpoint({
    method: "GET",
    path: "/health",
    expectedStatus: 200,
  })

  const loginBody = await assertEndpoint<{
    accessToken: string
    refreshToken: string
  }>({
    method: "POST",
    path: `/${apiPrefix}/auth/login`,
    expectedStatus: 200,
    body: { email: "demo@pontomax.com.br", password: "123456" },
  })

  const refreshBody = await assertEndpoint<{
    accessToken: string
    refreshToken: string
  }>({
    method: "POST",
    path: `/${apiPrefix}/auth/refresh`,
    expectedStatus: 200,
    body: { refreshToken: loginBody.refreshToken },
  })

  const authenticatedEndpoints: Endpoint[] = [
    { method: "GET", path: `/${apiPrefix}/auth/me`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/users`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/companies`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/holidays`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/time-records`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/work-schedules`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/adjustment-requests`, expectedStatus: 200 },
    { method: "GET", path: `/${apiPrefix}/analytics/overview`, expectedStatus: 200 },
  ]

  for (const endpoint of authenticatedEndpoints) {
    await assertEndpoint({
      ...endpoint,
      token: refreshBody.accessToken,
    })
  }

  console.log("Smoke test finished successfully.")
}

async function assertEndpoint<T = Record<string, unknown>>(endpoint: Endpoint) {
  const response = await fetch(`${baseUrl}${endpoint.path}`, {
    method: endpoint.method,
    headers: {
      "Content-Type": "application/json",
      ...(endpoint.token ? { Authorization: `Bearer ${endpoint.token}` } : {}),
    },
    body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
  })

  const body =
    response.status === 204 ? null : ((await response.json()) as T | { message?: string })
  const success = response.status === endpoint.expectedStatus
  const label = success ? "PASS" : "FAIL"

  console.log(
    `[${label}] ${endpoint.method} ${endpoint.path} -> ${response.status} (expected ${endpoint.expectedStatus})`,
  )

  if (!success) {
    console.error(body)
    process.exit(1)
  }

  return body as T
}

run().catch((error) => {
  console.error("Could not run smoke test. Make sure the API is running.")
  console.error(error)
  process.exit(1)
})
