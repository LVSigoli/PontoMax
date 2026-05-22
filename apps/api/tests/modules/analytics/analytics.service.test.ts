import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => {
  return {
    prisma: {
      user: {
        findMany: vi.fn(),
      },
      workday: {
        findMany: vi.fn(),
      },
      adjustmentRequest: {
        findMany: vi.fn(),
      },
    },
  }
})

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { getAnalyticsDashboard } = await import(
  "../../../src/modules/analytics/analytics.service.js"
)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-05-15T12:00:00.000Z"))

  mocked.prisma.user.findMany.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.adjustmentRequest.findMany.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("analytics service", () => {
  it("aggregates dashboard metrics for the selected range", async () => {
    mocked.prisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        fullName: "Maria Demo",
      },
      {
        id: 2,
        fullName: "Joao Demo",
      },
      {
        id: 3,
        fullName: "Ana Demo",
      },
    ])
    mocked.prisma.workday.findMany.mockResolvedValue([
      {
        userId: 1,
        date: new Date("2026-05-10T00:00:00.000Z"),
        status: "PENDING_ADJUSTMENT",
        overtimeMinutes: 120,
        missingMinutes: 0,
        workedMinutes: 600,
        timeEntries: [{ kind: "ENTRY", status: "ACTIVE" }],
      },
      {
        userId: 2,
        date: new Date("2026-05-12T00:00:00.000Z"),
        status: "LATE",
        overtimeMinutes: 30,
        missingMinutes: 15,
        workedMinutes: 450,
        timeEntries: [{ kind: "ENTRY", status: "ACTIVE" }],
      },
      {
        userId: 2,
        date: new Date("2026-05-14T00:00:00.000Z"),
        status: "INCONSISTENT",
        overtimeMinutes: 0,
        missingMinutes: 60,
        workedMinutes: 240,
        timeEntries: [],
      },
    ])
    mocked.prisma.adjustmentRequest.findMany.mockResolvedValue([
      {
        requestedAt: new Date("2026-05-10T12:00:00.000Z"),
        status: "PENDING",
      },
      {
        requestedAt: new Date("2026-05-12T12:00:00.000Z"),
        status: "APPROVED",
      },
      {
        requestedAt: new Date("2026-05-12T18:00:00.000Z"),
        status: "REJECTED",
      },
    ])

    const dashboard = await getAnalyticsDashboard({
      companyId: 10,
      period: "custom",
      from: "2026-05-10",
      to: "2026-05-15",
    })

    expect(dashboard.metrics).toEqual({
      presentEmployees: 2,
      companyEmployees: 3,
      lateWorkdays: 1,
      overtimeMinutes: 150,
      pendingAdjustments: 1,
      inconsistentWorkdays: 2,
    })
    expect(dashboard.balances).toEqual([
      {
        id: 1,
        name: "Maria Demo",
        balanceMinutes: 120,
      },
      {
        id: 3,
        name: "Ana Demo",
        balanceMinutes: 0,
      },
      {
        id: 2,
        name: "Joao Demo",
        balanceMinutes: -45,
      },
    ])
    expect(dashboard.solicitationChart).toHaveLength(6)
    expect(
      dashboard.solicitationChart.reduce(
        (summary, item) => ({
          approved: summary.approved + item.approved,
          pending: summary.pending + item.pending,
          refused: summary.refused + item.refused,
        }),
        {
          approved: 0,
          pending: 0,
          refused: 0,
        }
      )
    ).toEqual({
      approved: 1,
      pending: 1,
      refused: 1,
    })
    expect(dashboard.workedHours).toHaveLength(6)
    expect(dashboard.workedHours).toContainEqual(
      expect.objectContaining({
        hours: 10,
      })
    )
    expect(mocked.prisma.workday.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: 10,
          date: {
            gte: new Date("2026-05-10T00:00:00.000Z"),
            lte: new Date("2026-05-15T00:00:00.000Z"),
          },
        }),
      })
    )
  })
})
