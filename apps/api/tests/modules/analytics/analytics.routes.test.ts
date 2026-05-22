import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    getAnalyticsDashboardMock: vi.fn(),
    prisma: {
      user: {
        count: vi.fn(),
      },
      workday: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      adjustmentRequest: {
        count: vi.fn(),
      },
    },
  }
})

vi.mock("../../../src/common/auth/auth.middleware.js", () => ({
  authenticate: mocked.authenticateMock,
}))

vi.mock("../../../src/common/auth/require-role.middleware.js", () => ({
  requireRole: mocked.requireRoleMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

vi.mock("../../../src/modules/analytics/analytics.service.js", () => ({
  getAnalyticsDashboard: mocked.getAnalyticsDashboardMock,
}))

const { analyticsRouter } = await import(
  "../../../src/modules/analytics/analytics.routes.js"
)

const app = createRouterApp(analyticsRouter, "/analytics")

let authUser = {
  id: 1,
  companyId: 10,
  role: "PLATFORM_ADMIN",
  email: "admin@example.com",
}

beforeEach(() => {
  authUser = {
    id: 1,
    companyId: 10,
    role: "PLATFORM_ADMIN",
    email: "admin@example.com",
  }

  mocked.authenticateMock.mockImplementation((request, _response, next) => {
    request.authUser = authUser
    next()
  })
  mocked.requireRoleMock.mockImplementation(() => (_request, _response, next) => {
    next()
  })
  mocked.getAnalyticsDashboardMock.mockReset()
  mocked.prisma.user.count.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.workday.count.mockReset()
  mocked.prisma.adjustmentRequest.count.mockReset()
})

describe("analytics routes", () => {
  it("returns overview metrics", async () => {
    mocked.prisma.user.count.mockResolvedValue(5)
    mocked.prisma.workday.findMany.mockResolvedValue([
      {
        timeEntries: [{ kind: "ENTRY" }],
        overtimeMinutes: 30,
        workedMinutes: 480,
      },
      {
        timeEntries: [],
        overtimeMinutes: 0,
        workedMinutes: 0,
      },
    ])
    mocked.prisma.adjustmentRequest.count.mockResolvedValue(2)
    mocked.prisma.workday.count.mockResolvedValue(1)

    const response = await request(app).get("/analytics/overview")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      metrics: {
        presentEmployees: 1,
        companyEmployees: 5,
        overtimeMinutes: 30,
        pendingAdjustments: 2,
        inconsistentWorkdays: 1,
        totalWorkedHours: 8,
      },
    })
  })

  it("delegates dashboard generation to the analytics service", async () => {
    const dashboard = {
      metrics: {
        presentEmployees: 3,
        companyEmployees: 8,
        lateWorkdays: 1,
        overtimeMinutes: 120,
        pendingAdjustments: 2,
        inconsistentWorkdays: 1,
      },
      balances: [],
      solicitationChart: [],
      workedHours: [],
    }

    mocked.getAnalyticsDashboardMock.mockResolvedValue(dashboard)

    const response = await request(app).get(
      "/analytics/dashboard?companyId=10&period=custom&from=2026-05-01&to=2026-05-15"
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual(dashboard)
    expect(mocked.getAnalyticsDashboardMock).toHaveBeenCalledWith({
      companyId: 10,
      period: "custom",
      from: "2026-05-01",
      to: "2026-05-15",
    })
  })

  it("validates custom periods before delegating to the service", async () => {
    const response = await request(app).get("/analytics/dashboard?period=custom")

    expect(response.status).toBe(400)
    expect(mocked.getAnalyticsDashboardMock).not.toHaveBeenCalled()
  })
})
