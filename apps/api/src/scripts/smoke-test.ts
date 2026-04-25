const port = process.env.PORT ?? "3333"
const apiPrefix = process.env.API_PREFIX ?? "api"
const baseUrl = `http://localhost:${port}`

interface Endpoint {
  method: "GET" | "POST"
  path: string
  expectedStatus: number
  body?: Record<string, string>
}

const endpoints: Endpoint[] = [
  { method: "GET", path: "/health", expectedStatus: 200 },
  { method: "GET", path: `/${apiPrefix}/users`, expectedStatus: 200 },
  { method: "GET", path: `/${apiPrefix}/companies`, expectedStatus: 200 },
  { method: "GET", path: `/${apiPrefix}/holidays`, expectedStatus: 200 },
  { method: "GET", path: `/${apiPrefix}/time-records`, expectedStatus: 200 },
  { method: "GET", path: `/${apiPrefix}/work-schedules`, expectedStatus: 200 },
  {
    method: "POST",
    path: `/${apiPrefix}/auth/login`,
    expectedStatus: 200,
    body: { email: "demo@pontomax.com.br", password: "123456" },
  },
  {
    method: "POST",
    path: `/${apiPrefix}/auth/refresh`,
    expectedStatus: 200,
    body: { refreshToken: "demo-refresh-token" },
  },
]

async function run() {
  console.log(`Running smoke test against ${baseUrl}`)

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    })

    const body = await response.json()
    const success = response.status === endpoint.expectedStatus
    const label = success ? "PASS" : "FAIL"

    console.log(
      `[${label}] ${endpoint.method} ${endpoint.path} -> ${response.status} (expected ${endpoint.expectedStatus})`,
    )

    if (!success) {
      console.error(body)
      process.exit(1)
    }
  }

  console.log("Smoke test finished successfully.")
}

run().catch((error) => {
  console.error("Could not run smoke test. Make sure the API is running.")
  console.error(error)
  process.exit(1)
})
