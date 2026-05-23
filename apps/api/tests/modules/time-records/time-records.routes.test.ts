import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    createTimeEntryMock: vi.fn(),
    getTodayWorkdaySnapshotMock: vi.fn(),
    getWorkdayOverviewMock: vi.fn(),
    getUserWorkdaySummaryMock: vi.fn(),
    serializeTimeEntryMock: vi.fn(),
    serializeWorkdayMock: vi.fn(),
    prisma: {
      workday: {
        findMany: vi.fn(),
      },
      user: {
        findUniqueOrThrow: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
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

vi.mock("../../../src/modules/time-records/time-records.service.js", () => ({
  createTimeEntry: mocked.createTimeEntryMock,
  getTodayWorkdaySnapshot: mocked.getTodayWorkdaySnapshotMock,
  getWorkdayOverview: mocked.getWorkdayOverviewMock,
  getUserWorkdaySummary: mocked.getUserWorkdaySummaryMock,
  serializeTimeEntry: mocked.serializeTimeEntryMock,
  serializeWorkday: mocked.serializeWorkdayMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { timeRecordsRouter } = await import(
  "../../../src/modules/time-records/time-records.routes.js"
)

const app = createRouterApp(timeRecordsRouter, "/time-records")

let authUser = {
  id: 1,
  companyId: 10,
  role: "COMPANY_ADMIN",
  email: "manager@example.com",
}

beforeEach(() => {
  authUser = {
    id: 1,
    companyId: 10,
    role: "COMPANY_ADMIN",
    email: "manager@example.com",
  }

  mocked.authenticateMock.mockImplementation((request, _response, next) => {
    request.authUser = authUser
    next()
  })
  mocked.createTimeEntryMock.mockReset()
  mocked.getTodayWorkdaySnapshotMock.mockReset()
  mocked.getWorkdayOverviewMock.mockReset()
  mocked.getUserWorkdaySummaryMock.mockReset()
  mocked.serializeTimeEntryMock.mockImplementation((entry) => entry)
  mocked.serializeWorkdayMock.mockImplementation((workday) => workday)
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.user.findUniqueOrThrow.mockReset()
  mocked.prisma.auditLog.create.mockReset()
})

describe("time records routes", () => {
  it("registers a time entry", async () => {
    mocked.createTimeEntryMock.mockResolvedValue({
      entry: {
        id: 900,
        kind: "ENTRY",
        latitude: -23.55052,
        longitude: -46.633308,
        accuracyMeters: 12.5,
        source: "WEB",
        status: "ACTIVE",
        sequence: 1,
        timezone: "America/Sao_Paulo",
        recordedAt: new Date("2026-05-11T11:00:00.000Z"),
      },
      workday: {
        id: 501,
        date: "2026-05-11",
        status: "CLOSED",
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 0,
        isHoliday: false,
        timeEntries: [],
      },
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).post("/time-records/register").send({
      recordedAt: "2026-05-11T11:00:00.000Z",
      kind: "ENTRY",
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
        accuracyMeters: 12.5,
      },
      timezone: "America/Sao_Paulo",
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      entry: {
        id: 900,
        kind: "ENTRY",
        latitude: -23.55052,
        longitude: -46.633308,
        accuracyMeters: 12.5,
        source: "WEB",
        status: "ACTIVE",
        sequence: 1,
        timezone: "America/Sao_Paulo",
        recordedAt: "2026-05-11T11:00:00.000Z",
      },
      workday: {
        id: 501,
        date: "2026-05-11",
        status: "CLOSED",
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 0,
        isHoliday: false,
        timeEntries: [],
      },
    })
    expect(mocked.createTimeEntryMock).toHaveBeenCalledWith({
      companyId: 10,
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
        accuracyMeters: 12.5,
      },
      userId: 1,
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
      source: "WEB",
      kind: "ENTRY",
      timezone: "America/Sao_Paulo",
    })
  })

  it("returns the team snapshot for the current company", async () => {
    mocked.prisma.workday.findMany.mockResolvedValue([
      {
        userId: 2,
        user: {
          fullName: "Maria Demo",
        },
        status: "CLOSED",
        workedMinutes: 480,
        timeEntries: [
          {
            recordedAt: new Date("2026-05-11T20:00:00.000Z"),
          },
        ],
      },
    ])

    const response = await request(app).get("/time-records/team/today?companyId=10")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [
        {
          userId: 2,
          userName: "Maria Demo",
          status: "CLOSED",
          workedMinutes: 480,
          lastEntryAt: "2026-05-11T20:00:00.000Z",
        },
      ],
    })
  })

  it("passes the company scope when loading the overview", async () => {
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      companyId: 10,
      company: {
        timezone: "America/Sao_Paulo",
      },
    })
    mocked.getWorkdayOverviewMock.mockResolvedValue({
      items: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
      },
    })

    const response = await request(app).get(
      "/time-records/overview?page=1&pageSize=20&from=2026-05-01&to=2026-05-15"
    )

    expect(response.status).toBe(200)
    expect(mocked.getWorkdayOverviewMock).toHaveBeenCalledWith({
      companyId: 10,
      from: "2026-05-01",
      userId: 1,
      page: 1,
      pageSize: 20,
      timezone: "America/Sao_Paulo",
      to: "2026-05-15",
    })
  })

  it("passes the selected period when loading the summary", async () => {
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      companyId: 10,
      company: {
        timezone: "America/Sao_Paulo",
      },
    })
    mocked.getUserWorkdaySummaryMock.mockResolvedValue({
      workedDays: 10,
      balanceMinutes: 120,
      inconsistentCount: 1,
      pendingAdjustments: 2,
    })

    const response = await request(app).get(
      "/time-records/summary?from=2026-05-01&to=2026-05-15"
    )

    expect(response.status).toBe(200)
    expect(mocked.getUserWorkdaySummaryMock).toHaveBeenCalledWith({
      companyId: 10,
      from: "2026-05-01",
      userId: 1,
      timezone: "America/Sao_Paulo",
      to: "2026-05-15",
    })
  })
})
