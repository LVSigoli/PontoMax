import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => {
  return {
    getUserWorkdaySummaryMock: vi.fn(),
    prisma: {
      user: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      workday: {
        findMany: vi.fn(),
      },
      adjustmentRequest: {
        findMany: vi.fn(),
      },
      userJourneyAssignment: {
        findMany: vi.fn(),
      },
    },
  }
})

vi.mock("../../../src/modules/time-records/time-records.service.js", () => ({
  getUserWorkdaySummary: mocked.getUserWorkdaySummaryMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { getAnalyticsDashboard } = await import(
  "../../../src/modules/analytics/analytics.service.js"
)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-05-15T12:00:00.000Z"))

  mocked.getUserWorkdaySummaryMock.mockReset()
  mocked.prisma.user.count.mockReset()
  mocked.prisma.user.findMany.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.adjustmentRequest.findMany.mockReset()
  mocked.prisma.userJourneyAssignment.findMany.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("analytics service", () => {
  it("aggregates dashboard metrics and ranking data", async () => {
    mocked.prisma.user.count.mockResolvedValue(4)
    mocked.prisma.workday.findMany
      .mockResolvedValueOnce([
        {
          userId: 1,
          date: new Date("2026-05-15T00:00:00.000Z"),
          status: "LATE",
          overtimeMinutes: 30,
          workedMinutes: 510,
          isHoliday: false,
          timeEntries: [{ kind: "ENTRY" }],
          user: {
            fullName: "Maria Demo",
          },
        },
        {
          userId: 2,
          date: new Date("2026-05-15T00:00:00.000Z"),
          status: "CLOSED",
          overtimeMinutes: 0,
          workedMinutes: 480,
          isHoliday: false,
          timeEntries: [],
          user: {
            fullName: "Joao Demo",
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          userId: 1,
          date: new Date("2026-05-14T00:00:00.000Z"),
          status: "PENDING_ADJUSTMENT",
          overtimeMinutes: 60,
          workedMinutes: 540,
          isHoliday: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          userId: 1,
          date: new Date("2026-05-14T00:00:00.000Z"),
          status: "CLOSED",
          overtimeMinutes: 0,
          workedMinutes: 480,
          isHoliday: false,
        },
      ])
    mocked.prisma.adjustmentRequest.findMany.mockResolvedValue([
      {
        requestedAt: new Date("2026-05-13T00:00:00.000Z"),
        status: "PENDING",
      },
      {
        requestedAt: new Date("2026-05-13T00:00:00.000Z"),
        status: "APPROVED",
      },
      {
        requestedAt: new Date("2026-05-13T00:00:00.000Z"),
        status: "REJECTED",
      },
    ])
    mocked.prisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        companyId: 10,
        fullName: "Maria Demo",
        company: {
          timezone: "America/Sao_Paulo",
        },
      },
      {
        id: 2,
        companyId: 10,
        fullName: "Joao Demo",
        company: {
          timezone: "America/Sao_Paulo",
        },
      },
    ])
    mocked.prisma.userJourneyAssignment.findMany.mockResolvedValue([
      {
        userId: 1,
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
        validTo: null,
        journey: {
          scaleCode: "5X2",
          dailyWorkMinutes: 480,
          expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: false,
        },
      },
    ])
    mocked.getUserWorkdaySummaryMock
      .mockResolvedValueOnce({
        workedDays: 10,
        balanceMinutes: 50,
        inconsistentCount: 1,
        pendingAdjustments: 0,
      })
      .mockResolvedValueOnce({
        workedDays: 8,
        balanceMinutes: 20,
        inconsistentCount: 0,
        pendingAdjustments: 0,
      })

    const dashboard = await getAnalyticsDashboard(10)

    expect(dashboard.metrics).toEqual({
      presentEmployees: 1,
      companyEmployees: 4,
      lateWorkdays: 1,
      overtimeMinutes: 60,
      pendingAdjustments: 1,
      inconsistentWorkdays: 1,
    })
    expect(dashboard.balances).toEqual([
      {
        id: 1,
        name: "Maria Demo",
        balanceMinutes: 50,
      },
      {
        id: 2,
        name: "Joao Demo",
        balanceMinutes: 20,
      },
    ])
    expect(dashboard.solicitationChart).toContainEqual(
      expect.objectContaining({
        approved: 1,
        pending: 1,
        refused: 1,
      })
    )
    expect(dashboard.workedHours).toHaveLength(5)
    expect(dashboard.workedHours).toContainEqual(
      expect.objectContaining({
        hours: 8,
      })
    )
    expect(mocked.getUserWorkdaySummaryMock).toHaveBeenCalledTimes(2)
  })
})
